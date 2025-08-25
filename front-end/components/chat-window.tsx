"use client";

import { useState } from "react";
import { AiMessage } from "@/components/ai-message";
import { UserMessage } from "@/components/user-message";
import { ChatInput } from "@/components/chat-input";
import { Button } from "@/components/ui/button";
import Form from "next/form";
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

const AVAILABLE_MODELS = [
  { id: "gpt-4", name: "GPT-4" },
  { id: "claude", name: "Claude" },
  { id: "gemini", name: "Gemini" },
  { id: "ollama", name: "ollama" },
];

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

  const handleModelChange = (modelIds: string[]) => {
    setSelectedModels(modelIds);

    // Create new chat instances for newly selected models
    const newChats = modelIds.map((modelId) => {
      const existingChat = modelChats.find((chat) => chat.id === modelId);
      if (existingChat) return existingChat;

      const model = AVAILABLE_MODELS.find((m) => m.id === modelId)!;
      return {
        id: modelId,
        name: model.name,
        messages: [
          {
            id: Date.now().toString(),
            content: `안녕하세요! 저는 ${model.name}입니다. 오늘 어떻게 도와드릴까요?`,
            sender: "ai" as const,
            timestamp: new Date(),
            modelName: model.name,
          },
        ],
        isLoading: false,
      };
    });

    setModelChats(newChats);
  };

  const getGridLayout = () => {
    const count = selectedModels.length;
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-2 grid-rows-2";
    return "grid-cols-2 grid-rows-2";
  };

  const formAction = () => {};

  const isAnyLoading = modelChats.some((chat) => chat.isLoading);

  return (
    <div className="h-screen flex flex-col">
      {/* Chat Header with Model Selection */}
      <div className="border-b border-border p-4 bg-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-semibold text-foreground">ChatAI</h1>
            <p className="text-sm text-muted-foreground">
              여러 AI 모델과 동시에 대화하세요
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {AVAILABLE_MODELS.map((model) => (
            <Button
              key={model.id}
              variant={
                selectedModels.includes(model.id) ? "default" : "outline"
              }
              size="sm"
              onClick={() => {
                if (selectedModels.includes(model.id)) {
                  if (selectedModels.length > 1) {
                    handleModelChange(
                      selectedModels.filter((id) => id !== model.id)
                    );
                  }
                } else {
                  if (selectedModels.length < 4) {
                    handleModelChange([...selectedModels, model.id]);
                  }
                }
              }}
              disabled={
                !selectedModels.includes(model.id) && selectedModels.length >= 4
              }
            >
              {model.name}
            </Button>
          ))}
        </div>
      </div>

      <div
        className={`flex-1 grid ${getGridLayout()} gap-1 bg-muted/20 min-h-0`}
      >
        {modelChats.map((chat) => (
          <div key={chat.id} className="flex flex-col bg-background min-h-0">
            {/* Individual model header */}
            {selectedModels.length > 1 && (
              <div className="border-b border-border p-2 bg-card/50 flex-shrink-0">
                <h3 className="text-sm font-medium text-foreground">
                  {chat.name}
                </h3>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {chat.messages.map((message) =>
                message.sender === "ai" ? (
                  <AiMessage key={message.id} content={message.content} />
                ) : (
                  <UserMessage key={message.id} content={message.content} />
                )
              )}

              {chat.isLoading && <AiMessage content="" isLoading={true} />}
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input - shared across all models */}
      <div className="border-t border-border bg-card flex-shrink-0">
        <Form action={formAction}>
          <ChatInput isLoading={isAnyLoading} />
        </Form>
      </div>
    </div>
  );
}
