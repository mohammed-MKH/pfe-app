import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    const messages = [
      ...history,
      { role: "user", content: message },
    ]

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":         "application/json",
        "x-api-key":            process.env.ANTHROPIC_API_KEY!,
        "anthropic-version":    "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: `You are an industrial electrical engineering assistant specialized in:
- French and Algerian electrical standards (NF C 15-100, NFC 15-100, NF EN standards)
- Industrial electrical installations and maintenance
- Circuit breakers, contactors, cables, protection devices
- Project material tracking and verification
- Safety regulations for industrial sites

Answer clearly and concisely. When relevant, mention specific norms and standards.
Always respond in the same language the user writes in (French or English).
Keep answers practical and focused on industrial applications.`,
        messages,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")

    return NextResponse.json({ reply: text })
  } catch (err: any) {
    console.error("AI route error:", err)
    return NextResponse.json(
      { error: err.message || "AI error" },
      { status: 500 }
    )
  }
}