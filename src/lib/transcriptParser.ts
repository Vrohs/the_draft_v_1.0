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

        const colonIndex = trimmedLine.indexOf(':')

        if (colonIndex !== -1) {
            const potentialName = trimmedLine.substring(0, colonIndex).trim()
            const dialogueText = trimmedLine.substring(colonIndex + 1).trim()

            let mappedName = null

            if (characterMap[potentialName]) {
                mappedName = characterMap[potentialName]
            } else {
                mappedName = potentialName.toUpperCase()
            }

            if (mappedName && dialogueText) {
                content.push({
                    type: 'character',
                    content: [{ type: 'text', text: mappedName }]
                })
                content.push({
                    type: 'dialogue',
                    content: [{ type: 'text', text: dialogueText }]
                })
                continue
            }
        }

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
