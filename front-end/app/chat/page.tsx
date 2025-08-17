"use client";

import { ChatWindow } from "@/components/chat-window";
import "@/components/whisper-page";
import { Sidebar } from "@/components/sidebar"

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1">
        <ChatWindow />
      </div>
    </div>
  );
}
