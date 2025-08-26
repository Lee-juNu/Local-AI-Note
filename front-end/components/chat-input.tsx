"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  isLoading: boolean;
}

export function ChatInput({ isLoading }: ChatInputProps) {
  return (
    <div className="border-t border-border p-4">
      <div className="flex space-x-2">
        <Input
          name="input_text"
          placeholder="메시지를 입력하세요..."
          className="flex-1 bg-input border-border focus:ring-ring"
          readOnly={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Send size={16} />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Enter 전송 / Shift+Enter 줄바꿈
      </p>
    </div>
  );
}
