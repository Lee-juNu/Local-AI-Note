"use client";

import { useEffect, useMemo, useState } from "react";
import { AiMessage } from "@/components/ai-message";
import { UserMessage } from "@/components/user-message";
import { Button } from "@/components/ui/button";
import Form from "next/form";
import { useActionState } from "react";
import { ChatInput } from "./chat-input";
import { chatMultiFormAction } from "@/lib/action/llms/chat-multi";

// 프리셋: UI id → { provider, model, label }
const MODEL_PRESETS = {
  "gpt-4": { provider: "openai", model: "gpt-4o-mini", label: "GPT-4" },
  claude: {
    provider: "anthropic",
    model: "claude-3-5-haiku-latest",
    label: "Claude",
  },
  gemini: { provider: "gemini", model: "gemini-1.5-pro", label: "Gemini" },
  ollama: {
    provider: "ollama",
    model: "gpt-oss:20b",
    label: "ollama",
  },
} as const;

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  modelName?: string;
}
interface ModelChat {
  id: string;
  name: string;
  messages: Message[];
  isLoading: boolean;
}

export function ChatWindow() {
  const [selectedModels, setSelectedModels] = useState<string[]>(["gpt-4"]);
  const [modelChats, setModelChats] = useState<ModelChat[]>([
    {
      id: "gpt-4",
      name: "GPT-4",
      messages: [
        {
          id: "1",
          content: "안녕하세요! 저는 GPT-4입니다. 오늘 어떻게 도와드릴까요?",
          sender: "ai",
          timestamp: new Date(),
          modelName: "GPT-4",
        },
      ],
      isLoading: false,
    },
  ]);

  const [state, formAction] = useActionState(chatMultiFormAction, {
    ok: false,
    items: [],
  });

  const handleModelChange = (modelIds: string[]) => {
    setSelectedModels(modelIds);
    const newChats = modelIds.map((modelId) => {
      const exist = modelChats.find((c) => c.id === modelId);
      if (exist) return exist;
      const preset = MODEL_PRESETS[modelId as keyof typeof MODEL_PRESETS];
      return {
        id: modelId,
        name: preset.label,
        messages: [
          {
            id: Date.now().toString(),
            content: `안녕하세요! 저는 ${preset.label}입니다. 오늘 어떻게 도와드릴까요?`,
            sender: "ai" as const,
            timestamp: new Date(),
            modelName: preset.label,
          },
        ],
        isLoading: false,
      };
    });
    setModelChats(newChats);
  };

  const isAnyLoading = modelChats.some((c) => c.isLoading);

  // Form 제출 직전: 사용자 메시지를 모든 선택 모델 대화에 추가하고 로딩 표시
  const onFormSubmitCapture = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const input = form.querySelector<HTMLInputElement>(
      'input[name="input_text"]'
    );
    const userText = input?.value?.trim() ?? "";
    if (!userText) return;

    setModelChats((prev) =>
      prev.map((chat) =>
        selectedModels.includes(chat.id)
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  id: crypto.randomUUID(),
                  content: userText,
                  sender: "user",
                  timestamp: new Date(),
                  modelName: chat.name,
                },
              ],
              isLoading: true,
            }
          : chat
      )
    );
  };

  // 서버액션 결과 반영
  useEffect(() => {
    if (!state || !state.items?.length) return;
    setModelChats((prev) =>
      prev.map((chat) => {
        const preset = MODEL_PRESETS[chat.id as keyof typeof MODEL_PRESETS];
        const key = `${preset.provider}:${preset.model}`;
        const item = state.items.find((i) => i.key === key);
        if (!item) return chat;
        const aiText =
          item.ok && item.data?.output?.content
            ? item.data.output.content
            : `ERROR: ${item.error ?? "unknown"}`;
        return {
          ...chat,
          isLoading: false,
          messages: [
            ...chat.messages,
            {
              id: crypto.randomUUID(),
              content: aiText,
              sender: "ai",
              timestamp: new Date(),
              modelName: chat.name,
            },
          ],
        };
      })
    );
  }, [state]);

  const selectedModelsJson = useMemo(
    () =>
      JSON.stringify(
        selectedModels.map((id) => {
          const p = MODEL_PRESETS[id as keyof typeof MODEL_PRESETS];
          return { provider: p.provider, model: p.model, label: p.label };
        })
      ),
    [selectedModels]
  );

  const getGridLayout = () => {
    const n = selectedModels.length;
    if (n === 1) return "grid-cols-1";
    if (n === 2) return "grid-cols-2";
    return "grid-cols-2 grid-rows-2";
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b border-border p-4 bg-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-semibold text-foreground">ChatAI</h1>
            <p className="text-sm text-muted-foreground">
              여러 AI 모델과 동시에 대화
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(MODEL_PRESETS).map(([id, preset]) => (
            <Button
              key={id}
              variant={selectedModels.includes(id) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (selectedModels.includes(id)) {
                  if (selectedModels.length > 1)
                    handleModelChange(selectedModels.filter((x) => x !== id));
                } else if (selectedModels.length < 4) {
                  handleModelChange([...selectedModels, id]);
                }
              }}
              disabled={
                !selectedModels.includes(id) && selectedModels.length >= 4
              }
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div
        className={`flex-1 grid ${getGridLayout()} gap-1 bg-muted/20 min-h-0`}
      >
        {modelChats.map((chat) => (
          <div key={chat.id} className="flex flex-col bg-background min-h-0">
            {selectedModels.length > 1 && (
              <div className="border-b border-border p-2 bg-card/50 flex-shrink-0">
                <h3 className="text-sm font-medium text-foreground">
                  {chat.name}
                </h3>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {chat.messages.map((m) =>
                m.sender === "ai" ? (
                  <AiMessage key={m.id} content={m.content} />
                ) : (
                  <UserMessage key={m.id} content={m.content} />
                )
              )}
              {chat.isLoading && <AiMessage content="" isLoading={true} />}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border bg-card flex-shrink-0">
        <Form
          action={formAction}
          onSubmitCapture={onFormSubmitCapture}
          className="space-y-0"
        >
          {/* 선택 모델들 JSON */}
          <input
            type="hidden"
            name="selected_models_json"
            value={selectedModelsJson}
          />
          {/* 공통 파라미터(원하면 UI 노출) */}
          <input type="hidden" name="temperature" value="0.7" />
          <input type="hidden" name="top_p" value="" />
          <input type="hidden" name="max_tokens" value="512" />
          {/* 벤더 옵션(JSON) 필요 시 노출 */}
          <input type="hidden" name="vendor_options" value="{}" />

          <ChatInput isLoading={isAnyLoading} />
        </Form>
      </div>
    </div>
  );
}
