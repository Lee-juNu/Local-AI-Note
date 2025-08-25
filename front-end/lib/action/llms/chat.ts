"use server";

import "server-only";
import { z } from "zod";
import type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ServerActionResult,
  Provider,
} from "@/lib/types/llms";

// llm-hub API 베이스
const API_BASE = process.env.LLM_HUB_API ?? "http://localhost:8000";

/** Form → 기본 스칼라 파라미터 스키마 */
const scalarsSchema = z.object({
  provider: z.enum(["openai", "anthropic", "gemini", "ollama"]),
  model: z.string().min(1),
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

/**
 * messages 입력 방식:
 *  A) textarea에 JSON 배열로 전달
 *     [{ "role":"system","content":"..." }, {"role":"user","content":"..."}]
 *  B) 단일 user 입력값만 오는 경우: input_text로 받아 user 메시지 1개 생성
 */
const messagesJsonSchema = z
  .string()
  .transform((s) => s?.trim())
  .pipe(
    z.string().refine((s) => {
      if (!s) return false;
      try {
        const j = JSON.parse(s);
        return Array.isArray(j);
      } catch {
        return false;
      }
    }, "messages_json must be a JSON array")
  )
  .transform((s) => JSON.parse(s) as ChatMessage[]);

const singleInputSchema = z
  .string()
  .transform((s) => s?.trim())
  .refine((s) => !!s, "input_text is empty")
  .transform<ChatMessage[]>((s) => [{ role: "user", content: s }]);

/** vendor_options는 JSON 문자열로 전달(비어있으면 {}) */
const vendorOptionsSchema = z
  .string()
  .transform((s) => s?.trim())
  .transform((s) => (s ? s : "{}"))
  .transform<Record<string, unknown>>((s) => {
    try {
      return JSON.parse(s);
    } catch {
      throw new Error("vendor_options must be valid JSON");
    }
  });

/** FormData → ChatRequest */
function formToChatRequest(fd: FormData): ChatRequest {
  const scalars = scalarsSchema.parse({
    provider: fd.get("provider"),
    model: fd.get("model"),
    temperature: fd.get("temperature"),
    top_p: fd.get("top_p"),
    max_tokens: fd.get("max_tokens"),
  });

  const hasMessagesJson = !!(fd.get("messages_json") ?? "").toString().trim();
  const hasSingleInput = !!(fd.get("input_text") ?? "").toString().trim();

  let messages: ChatMessage[];
  if (hasMessagesJson) {
    messages = messagesJsonSchema.parse(fd.get("messages_json"));
  } else if (hasSingleInput) {
    messages = singleInputSchema.parse(fd.get("input_text"));
  } else {
    // 빈 메시지 방지
    messages = [{ role: "user", content: "" }];
  }

  const vendor_options = vendorOptionsSchema.parse(
    (fd.get("vendor_options") ?? "").toString()
  );

  const req: ChatRequest = {
    provider: scalars.provider as Provider,
    model: scalars.model,
    messages,
    temperature: scalars.temperature,
    top_p: scalars.top_p ?? null,
    max_tokens: scalars.max_tokens ?? null,
    vendor_options,
  };

  return req;
}

/** 서버액션: Form 제출 전용 */
export async function chatFormAction(
  _prevState: ServerActionResult | undefined,
  formData: FormData
): Promise<ServerActionResult> {
  try {
    const req = formToChatRequest(formData);

    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `API error: ${res.status} ${text}` };
    }

    const data: ChatResponse = await res.json();
    return { ok: true, data };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
