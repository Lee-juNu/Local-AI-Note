import { Bot } from "lucide-react"

interface AiMessageProps {
  content: string
  isLoading?: boolean
}

export function AiMessage({ content, isLoading = false }: AiMessageProps) {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
        <Bot size={16} />
      </div>
      <div className="bg-muted px-4 py-2 rounded-lg max-w-xs lg:max-w-md">
        {isLoading ? (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-card-foreground">{content}</p>
        )}
      </div>
    </div>
  )
}
