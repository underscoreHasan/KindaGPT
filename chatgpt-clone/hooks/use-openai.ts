"use client"

export async function getFeedback(question: string, response: string) {
  try {
    const result = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        response,
      }),
    })

    if (!result.ok) {
      throw new Error("Failed to get feedback")
    }

    const data = await result.json()
    return data.feedback
  } catch (error) {
    console.error("Error getting feedback:", error)
    return "Unable to get feedback at this time."
  }
}

