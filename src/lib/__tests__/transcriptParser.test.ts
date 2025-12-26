import { parseTranscript } from '../transcriptParser'

describe('parseTranscript', () => {
    it('generates correct slugline', () => {
        const result = parseTranscript('', { intExt: 'INT.', location: 'CAFE', time: 'DAY' })
        expect(result.content?.[0]).toEqual({
            type: 'slugline',
            content: [{ type: 'text', text: 'INT. CAFE - DAY' }]
        })
    })

    it('parses simple dialogue', () => {
        const text = `JOHN: Hello world.`
        const result = parseTranscript(text, { intExt: 'INT.', location: 'ROOM', time: 'DAY' })

        expect(result.content).toHaveLength(3) // Slug, Char, Dial
        expect(result.content?.[1]).toEqual({ type: 'character', content: [{ type: 'text', text: 'JOHN' }] })
        expect(result.content?.[2]).toEqual({ type: 'dialogue', content: [{ type: 'text', text: 'Hello world.' }] })
    })

    it('uses character map', () => {
        const text = `Vivek: Hi.\nGemini: Hello.`
        const map = { 'Vivek': 'VIVEK ROHTASVI', 'Gemini': 'AI ASSISTANT' }
        const result = parseTranscript(text, { intExt: 'INT.', location: 'ROOM', time: 'DAY' }, map)

        expect(result.content?.[1]).toEqual({ type: 'character', content: [{ type: 'text', text: 'VIVEK ROHTASVI' }] })
        expect(result.content?.[3]).toEqual({ type: 'character', content: [{ type: 'text', text: 'AI ASSISTANT' }] })
    })

    it('treats unformatted lines as action', () => {
        const text = `(Silence)`
        const result = parseTranscript(text, { intExt: 'INT.', location: 'ROOM', time: 'DAY' })

        expect(result.content?.[1]).toEqual({ type: 'action', content: [{ type: 'text', text: '(Silence)' }] })
    })
})
