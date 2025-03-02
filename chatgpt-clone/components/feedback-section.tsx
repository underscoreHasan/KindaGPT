import { Card, CardContent } from "@/components/ui/card"
import { Bot } from "lucide-react"

interface FeedbackSectionProps {
  feedback: string
}

export function FeedbackSection({ feedback }: FeedbackSectionProps) {
  return (
    <Card className="mt-2 bg-muted/50">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <Bot className="w-4 h-4 mt-1 text-muted-foreground" />
          <div className="flex-1">
            <div className="text-xs font-medium text-muted-foreground mb-1">Response Feedback:</div>
            <div className="text-sm text-muted-foreground">{feedback}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

