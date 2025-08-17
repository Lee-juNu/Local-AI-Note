import { User } from "lucide-react"

interface UserMessageProps {
  content: string
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex items-start space-x-3 flex-row-reverse space-x-reverse">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
        <User size={16} />
      </div>
      <div className="bg-primary px-4 py-2 rounded-lg max-w-xs lg:max-w-md">
        <p className="text-sm leading-relaxed text-primary-foreground">{content}</p>
      </div>
    </div>
  )
}
