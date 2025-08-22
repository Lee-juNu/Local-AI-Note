"use client"

import { useState } from "react"
import { AiMessage } from "@/components/ai-message"
import { UserMessage } from "@/components/user-message"
import { ChatInput } from "@/components/chat-input"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  modelName?: string
}

interface ModelChat {
  id: string
  name: string
  messages: Message[]
  isLoading: boolean
}

const AVAILABLE_MODELS = [
  { id: "gpt-4", name: "GPT-4" },
  { id: "claude", name: "Claude" },
  { id: "gemini", name: "Gemini" },
  { id: "llama", name: "Llama" },
]

export function ChatWindow() {
  const [selectedModels, setSelectedModels] = useState<string[]>(["gpt-4"])
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
  ])

  const handleModelChange = (modelIds: string[]) => {
    setSelectedModels(modelIds)

    // Create new chat instances for newly selected models
    const newChats = modelIds.map((modelId) => {
      const existingChat = modelChats.find((chat) => chat.id === modelId)
      if (existingChat) return existingChat

      const model = AVAILABLE_MODELS.find((m) => m.id === modelId)!
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
      }
    })

    setModelChats(newChats)
  }

/*
const handleSendMessage = async (content: string) => {
  if (!content.trim()) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    content,
    sender: "user",
    timestamp: new Date(),
  };
  setMessages((prev) => [...prev, userMessage]);
  setIsLoading(true);

  try {
    // FastAPI 호출
    const resp = await fetch(`http://localhost:8000/ask?q=${encodeURIComponent(content)}`);
    if (!resp.ok) throw new Error(`API ${resp.status}`);
    const data = await resp.json(); // { question, answer, sources }

    const aiMessage: Message = {
      id: `${userMessage.id}-ai`,
      content: data.answer ?? "",
      sender: "ai",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMessage]);
  } catch {
    setMessages((prev) => [
      ...prev,
      { id: `${userMessage.id}-ai`, content: "에러가 발생했습니다.", sender: "ai", timestamp: new Date() },
    ]);
  } finally {
    setIsLoading(false);
  }
};
*/
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    }

    setModelChats((prev) =>
      prev.map((chat) => ({
        ...chat,
        messages: [...chat.messages, userMessage],
        isLoading: true,
      })),
    )

    selectedModels.forEach((modelId, index) => {
      setTimeout(
        () => {
          const model = AVAILABLE_MODELS.find((m) => m.id === modelId)!
          const aiMessage: Message = {
            id: (Date.now() + index).toString(),
            content: `[${model.name}] 메시지를 보내주셔서 감사합니다! 이것은 ${model.name}의 데모 응답입니다. 실제 구현에서는 각 AI 모델의 고유한 특성을 반영한 응답을 제공할 것입니다.`,
            sender: "ai",
            timestamp: new Date(),
            modelName: model.name,
          }

          setModelChats((prev) =>
            prev.map((chat) =>
              chat.id === modelId ? { ...chat, messages: [...chat.messages, aiMessage], isLoading: false } : chat,
            ),
          )
        },
        1500 + index * 500,
      )
    })
  }

  const getGridLayout = () => {
    const count = selectedModels.length
    if (count === 1) return "grid-cols-1"
    if (count === 2) return "grid-cols-2"
    if (count === 3) return "grid-cols-2 grid-rows-2"
    return "grid-cols-2 grid-rows-2"
  }

  const isAnyLoading = modelChats.some((chat) => chat.isLoading)

  return (
    <div className="h-screen flex flex-col">
      {/* Chat Header with Model Selection */}
      <div className="border-b border-border p-4 bg-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-semibold text-foreground">ChatAI</h1>
            <p className="text-sm text-muted-foreground">여러 AI 모델과 동시에 대화하세요</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {AVAILABLE_MODELS.map((model) => (
            <Button
              key={model.id}
              variant={selectedModels.includes(model.id) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (selectedModels.includes(model.id)) {
                  if (selectedModels.length > 1) {
                    handleModelChange(selectedModels.filter((id) => id !== model.id))
                  }
                } else {
                  if (selectedModels.length < 4) {
                    handleModelChange([...selectedModels, model.id])
                  }
                }
              }}
              disabled={!selectedModels.includes(model.id) && selectedModels.length >= 4}
            >
              {model.name}
            </Button>
          ))}
        </div>
      </div>

      <div className={`flex-1 grid ${getGridLayout()} gap-1 bg-muted/20 min-h-0`}>
        {modelChats.map((chat) => (
          <div key={chat.id} className="flex flex-col bg-background min-h-0">
            {/* Individual model header */}
            {selectedModels.length > 1 && (
              <div className="border-b border-border p-2 bg-card/50 flex-shrink-0">
                <h3 className="text-sm font-medium text-foreground">{chat.name}</h3>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {chat.messages.map((message) =>
                message.sender === "ai" ? (
                  <AiMessage key={message.id} content={message.content} />
                ) : (
                  <UserMessage key={message.id} content={message.content} />
                ),
              )}

              {chat.isLoading && <AiMessage content="" isLoading={true} />}
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input - shared across all models */}
      <div className="border-t border-border bg-card flex-shrink-0">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isAnyLoading} />
      </div>
    </div>
  )
}
