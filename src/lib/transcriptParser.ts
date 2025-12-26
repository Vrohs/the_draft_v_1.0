import { JSONContent } from '@tiptap/core'

export interface SceneDetails {
    intExt: 'INT.' | 'EXT.'
    location: string
    time: 'DAY' | 'NIGHT'
}

export type CharacterMap = Record<string, string>

export const parseTranscript = (
    text: string,
    sceneDetails: SceneDetails,
    characterMap: CharacterMap = {}
): JSONContent => {
    const content: JSONContent[] = []

    // 1. Add Scene Heading (Slugline)
    content.push({
        type: 'slugline',
        content: [
            {
                type: 'text',
                text: `${sceneDetails.intExt} ${sceneDetails.location.toUpperCase()} - ${sceneDetails.time}`
            }
        ]
    })

    const lines = text.split('\n')

    for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine) continue

        // Check for "Name: Dialogue" pattern
        // We look for the first colon to split name and text
        const colonIndex = trimmedLine.indexOf(':')

        if (colonIndex !== -1) {
            const potentialName = trimmedLine.substring(0, colonIndex).trim()
            const dialogueText = trimmedLine.substring(colonIndex + 1).trim()

            // Check if this name is in our map (fuzzy check could be added later, but strict map for now)
            // If the user didn't provide a map, we can take the name as is?
            // "The initial implementation will assume a simple 'Character Name: Dialogue' format"

            // Refined Logic based on plan:
            // "Iterate through transcript lines: matches Name: Dialogue"
            // "fuzzy matches line starts against characterMap keys" - user plan

            // Let's check map match first
            let mappedName = null

            // Check exact map keys first
            if (characterMap[potentialName]) {
                mappedName = characterMap[potentialName]
            } else {
                // If not in map, just use uppercased name from transcript?
                // The plan says "matches matches line starts against characterMap keys"
                // But for general usage without map, we should fallback to using the name found.
                mappedName = potentialName.toUpperCase()
            }

            if (mappedName && dialogueText) {
                // Add Character
                content.push({
                    type: 'character',
                    content: [{ type: 'text', text: mappedName }]
                })
                // Add Dialogue
                content.push({
                    type: 'dialogue',
                    content: [{ type: 'text', text: dialogueText }]
                })
                continue
            }
        }

        // Fallback: Action
        content.push({
            type: 'action',
            content: [{ type: 'text', text: trimmedLine }]
        })
    }

    return {
        type: 'doc',
        content
    }
}
