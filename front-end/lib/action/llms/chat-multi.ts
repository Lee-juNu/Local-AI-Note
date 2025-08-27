"use server";

import "server-only";
import { z } from "zod";

import type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  Provider,
} from "@/lib/types/llms";
import type {
  OpenAIVendorOptions,
  AnthropicVendorOptions,
  GeminiVendorOptions,
  OllamaVendorOptions,
} from "@/lib/types/llms";

const API_BASE = process.env.LLM_HUB_API ?? "http://localhost:8000";

/** ---------- Schemas ---------- */

const providerEnum = z.enum(["openai", "anthropic", "gemini", "ollama"]);

const selectedModelsSchema = z
  .string()
  .transform((s) => (s?.trim() ? s.trim() : "[]"))
  .transform((s) => {
    try {
      return JSON.parse(s);
    } catch {
      return [];
    }
  })
  .pipe(
    z
      .array(
        z.object({
          provider: providerEnum,
          model: z.string().min(1),
          label: z.string().optional(),
        })
      )
      .min(1, "no selected models")
  );

const scalarSchema = z.object({
  temperature: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().min(0).max(2).optional()
  ),
  top_p: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().min(0).max(1).optional()
  ),
  max_tokens: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().int().positive().optional()
  ),
});

const messagesJsonSchema = z
  .string()
  .transform((s) => s?.trim() ?? "")
  .transform<ChatMessage[] | null>((s) => {
    if (!s) return null;
    const parsed = JSON.parse(s) as unknown;
    // 최소 검증: 배열이며 role/content 존재
    if (!Array.isArray(parsed)) return null;
    const ok = parsed.every(
      (m) =>
        typeof m === "object" &&
        m !== null &&
        "role" in m &&
        "content" in m &&
        (m as ChatMessage).role !== undefined &&
        typeof (m as ChatMessage).content === "string"
    );
    return ok ? (parsed as ChatMessage[]) : null;
  });

const inputSchema = z.object({
  input_text: z.string().transform((s) => s?.trim() ?? ""),
  messages_json: messagesJsonSchema,
  vendor_options: z
    .string()
    .transform((s) => s?.trim() ?? "")
    .transform<Record<string, unknown>>((s) =>
      s ? (JSON.parse(s) as Record<string, unknown>) : {}
    ),
});

/** ---------- Local Types ---------- */

type SelectedModel = z.infer<typeof selectedModelsSchema>[number];

export interface MultiResultItem {
  key: string; // provider:model
  provider: Provider;
  model: string;
  label?: string;
  ok: boolean;
  data?: ChatResponse;
  error?: string;
}

export interface MultiResult {
  ok: boolean;
  items: MultiResultItem[];
}

/** ---------- Helpers ---------- */

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function buildChatRequest(
  sel: SelectedModel,
  base: {
    messages: ChatMessage[];
    temperature?: number;
    top_p?: number | null;
    max_tokens?: number | null;
    vendor_options: Record<string, unknown>;
  }
): ChatRequest {
  const common = {
    model: sel.model,
    messages: base.messages,
    temperature: base.temperature,
    top_p: base.top_p ?? null,
    max_tokens: base.max_tokens ?? null,
  } as const;

  // provider별 vendor_options 타입 안전 분기
  switch (sel.provider) {
    case "openai": {
      const vo = base.vendor_options as OpenAIVendorOptions;
      return { provider: "openai", vendor_options: vo, ...common };
    }
    case "anthropic": {
      const vo = base.vendor_options as AnthropicVendorOptions;
      return { provider: "anthropic", vendor_options: vo, ...common };
    }
    case "gemini": {
      const vo = base.vendor_options as GeminiVendorOptions;
      return { provider: "gemini", vendor_options: vo, ...common };
    }
    case "ollama": {
      const vo = base.vendor_options as OllamaVendorOptions;
      return { provider: "ollama", vendor_options: vo, ...common };
    }
  }
}

/** ---------- Server Action ---------- */

export async function chatMultiFormAction(
  _prev: MultiResult | undefined,
  formData: FormData
): Promise<MultiResult> {
  try {
    const selected = selectedModelsSchema.parse(
      formData.get("selected_models_json") ?? ""
    );
    const scalars = scalarSchema.parse({
      temperature: formData.get("temperature"),
      top_p: formData.get("top_p"),
      max_tokens: formData.get("max_tokens"),
    });
    const inputs = inputSchema.parse({
      input_text: formData.get("input_text") ?? "",
      messages_json: formData.get("messages_json") ?? "",
      vendor_options: formData.get("vendor_options") ?? "",
    });

    const messages: ChatMessage[] =
      inputs.messages_json ??
      (inputs.input_text
        ? [{ role: "user", content: inputs.input_text }]
        : [{ role: "user", content: "" }]);

    const reqBase = {
      messages,
      temperature: scalars.temperature,
      top_p: scalars.top_p ?? null,
      max_tokens: scalars.max_tokens ?? null,
      vendor_options: inputs.vendor_options, // 각 분기에서 정확 타입으로 주입
    };

    const calls = selected.map(async (m): Promise<MultiResultItem> => {
      const key = `${m.provider}:${m.model}`;
      const body = buildChatRequest(m, reqBase);

      try {
        const res = await fetch(`${API_BASE}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const text = await res.text();
          return {
            key,
            provider: m.provider,
            model: m.model,
            label: m.label,
            ok: false,
            error: `${res.status} ${text}`,
          };
        }

        const data = (await res.json()) as ChatResponse;
        return {
          key,
          provider: m.provider,
          model: m.model,
          label: m.label,
          ok: true,
          data,
        };
      } catch (e: unknown) {
        return {
          key,
          provider: m.provider,
          model: m.model,
          label: m.label,
          ok: false,
          error: errMsg(e),
        };
      }
    });

    const items = await Promise.all(calls);
    const ok = items.every((i) => i.ok);
    return { ok, items };
  } catch (e: unknown) {
    return {
      ok: false,
      items: [
        {
          key: "parse",
          provider: "ollama", // dummy; UI 표시에만 사용
          model: "-",
          ok: false,
          error: errMsg(e),
        },
      ],
    };
  }
}
