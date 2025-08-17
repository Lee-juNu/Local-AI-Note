"use client"

import { useState } from "react"
import { AiMessage } from "@/components/ai-message"
import { UserMessage } from "@/components/user-message"
import { ChatInput } from "@/components/chat-input"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "안녕하세요! 저는 당신의 AI 어시스턴트입니다. 오늘 어떻게 도와드릴까요?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

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

  return (
    <div className="h-screen flex flex-col">
      {/* Chat Header */}
      <div className="border-b border-border p-4 bg-card">
        <h1 className="text-xl font-semibold text-foreground">ChatAI</h1>
        <p className="text-sm text-muted-foreground">AI와 대화를 시작하세요</p>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background">
        {messages.map((message) =>
          message.sender === "ai" ? (
            <AiMessage key={message.id} content={message.content} />
          ) : (
            <UserMessage key={message.id} content={message.content} />
          ),
        )}

        {isLoading && <AiMessage content="" isLoading={true} />}
      </div>

      {/* Chat Input */}
      <div className="border-t border-border bg-card">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
