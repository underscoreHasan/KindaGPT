import { Card, CardContent } from "@/components/ui/card"
import { Bot, CheckCircle2 } from "lucide-react"
import type * as React from "react"

interface FeedbackSectionProps {
  feedback: string
}

export function FeedbackSection({ feedback }: FeedbackSectionProps): React.JSX.Element {
  return (
    <div className="mt-4 mb-6">
      <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">Response Quality Analysis</div>
                <Bot className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              </div>
              <div className="text-base text-blue-700 dark:text-blue-200 leading-relaxed">{feedback}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

