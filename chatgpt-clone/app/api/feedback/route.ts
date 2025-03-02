import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { question, response } = await req.json()

    const prompt = `You are an expert at evaluating chat responses. Analyze this interaction:

Question: "${question}"
Response: "${response}"

Provide a brief (2-3 sentence) evaluation of how well this response addresses the question. Consider:
- Accuracy and correctness
- Completeness
- Clarity and tone
- Adherence to best practices

Show me how YOU would have responded, and then rate my response by how similar it was to you and how useful it was

Your evaluation:`

    const { text } = await generateText({
      model: openai("gpt-4"),
      prompt,
    })

    return Response.json({ feedback: text })
  } catch (error) {
    console.error("Error in feedback route:", error)
    return Response.json({ error: "Failed to generate feedback" }, { status: 500 })
  }
}

