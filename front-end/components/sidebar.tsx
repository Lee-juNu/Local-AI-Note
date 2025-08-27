"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, MessageSquare, Settings, ChevronLeft, ChevronRight } from "lucide-react"

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [sessions] = useState([
    { id: "1", title: "AI 어시스턴트와의 대화", date: "오늘" },
    { id: "2", title: "프로젝트 계획 논의", date: "어제" },
    { id: "3", title: "코딩 질문", date: "2일 전" },
  ])

  return (
    <div className={`bg-card border-r border-border transition-all duration-300 ${isCollapsed ? "w-16" : "w-80"}`}>
      <div className="p-4 h-full flex flex-col">
        {/* Header with collapse button */}
        <div className="flex items-center justify-between mb-6">
          {!isCollapsed && <h2 className="text-lg font-semibold text-foreground">ChatAI</h2>}
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="p-2">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* New Session Button */}
        <Button
          className="w-full mb-6 bg-primary hover:bg-primary/90 text-primary-foreground"
          size={isCollapsed ? "sm" : "default"}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">새로운 세션</span>}
        </Button>

        {/* Session History */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">대화 세션 로그</h3>
            <div className="space-y-2">
              {sessions.map((session) => (
                <Card key={session.id} className="p-3 hover:bg-accent cursor-pointer transition-colors">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{session.title}</p>
                      <p className="text-xs text-muted-foreground">{session.date}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Settings Button */}
        <Button variant="ghost" className="w-full mt-4 justify-start" size={isCollapsed ? "sm" : "default"}>
          <Settings className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">설정</span>}
        </Button>
      </div>
    </div>
  )
}
