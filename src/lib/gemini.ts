const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const SYSTEM_PROMPT = `You are a gentle, supportive companion for someone who is journaling to examine their life. 
Your role is like a thoughtful therapist - curious, warm, non-judgmental.

When responding to their writing:
- Offer ONE short, open-ended question or gentle observation (1-2 sentences max)
- Be curious about their feelings, not just facts
- Never give advice unless explicitly asked
- Use warm, simple language
- Help them go deeper into their experience
- If they express difficulty, acknowledge it with compassion

Examples of good responses:
- "What does that stir up in you?"
- "I'm curious what made you think of that today."
- "That sounds heavy. How are you holding that?"
- "What would it look like to give yourself permission for that?"

Keep responses SHORT - under 25 words. You are a gentle presence, not a lecturer.`

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

function getTimeContext(): TimeOfDay {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 11) return 'morning'
    if (hour >= 11 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 21) return 'evening'
    return 'night'
}

function getTimePromptModifier(time: TimeOfDay): string {
    switch (time) {
        case 'morning':
            return 'The person is writing in the morning. Your tone should be gently forward-looking and hopeful.'
        case 'afternoon':
            return 'The person is writing in the afternoon. Your tone should be grounded and present-focused.'
        case 'evening':
            return 'The person is writing in the evening. Your tone should be reflective and appreciative.'
        case 'night':
            return 'The person is writing late at night. Your tone should be quiet, introspective, and calming.'
    }
}

export async function generateReflectionPrompt(userWriting: string): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY

    if (!apiKey) {
        console.error('Gemini API key not found')
        return "What's on your mind right now?"
    }

    const timeOfDay = getTimeContext()
    const timeModifier = getTimePromptModifier(timeOfDay)

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${SYSTEM_PROMPT}\n\n${timeModifier}\n\nThe person just wrote:\n"${userWriting}"\n\nRespond with a single gentle question or observation (under 25 words):`
                    }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 50,
                }
            })
        })

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`)
        }

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text

        return text?.trim() || "What feels most present for you right now?"
    } catch (error) {
        console.error('Error calling Gemini API:', error)
        return "Take a breath. What wants to be written?"
    }
}

export { getTimeContext, type TimeOfDay }
