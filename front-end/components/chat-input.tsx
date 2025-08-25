"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

interface ChatInputProps {
  isLoading: boolean
}

export function ChatInput({ isLoading }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("")  

  return (
    <div className="border-t border-border p-4">
      <div className="flex space-x-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-1 bg-input border-border focus:ring-ring"
          disabled={isLoading}
        />
        <Button
          disabled={!inputValue.trim() || isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Send size={16} />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">Enter를 눌러 전송, Shift+Enter로 줄바꿈</p>
    </div>
  )
}
