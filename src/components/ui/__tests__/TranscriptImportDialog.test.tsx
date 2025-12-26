import { render, screen, fireEvent } from '@testing-library/react'
import { TranscriptImportDialog } from '../TranscriptImportDialog'
import '@testing-library/jest-dom'

// Mock the parseTranscript to avoid testing internal logic again
jest.mock('@/lib/transcriptParser', () => ({
    parseTranscript: jest.fn(() => ({ type: 'doc', content: [] })),
}))
import { parseTranscript } from '@/lib/transcriptParser'

describe('TranscriptImportDialog', () => {
    const mockOnClose = jest.fn()
    const mockOnImport = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders null when not open', () => {
        const { container } = render(
            <TranscriptImportDialog isOpen={false} onClose={mockOnClose} onImport={mockOnImport} />
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('renders correctly when open', () => {
        render(<TranscriptImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />)
        expect(screen.getByText('Import Transcript')).toBeInTheDocument()
        expect(screen.getByText('1. Scene Heading')).toBeInTheDocument()
    })

    it('calls onClose when close button clicked', () => {
        render(<TranscriptImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />)
        fireEvent.click(screen.getByText('Cancel'))
        expect(mockOnClose).toHaveBeenCalled()
    })

    it('calling import triggers processing with correct args', () => {
        render(<TranscriptImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />)

        // Fill Scene Details
        fireEvent.change(screen.getByPlaceholderText('LOCATION'), { target: { value: 'OFFICE' } })

        // Fill Map
        const inputs = screen.getAllByPlaceholderText('Transcript Name')
        fireEvent.change(inputs[0], { target: { value: 'Vivek' } })
        const outputs = screen.getAllByPlaceholderText('Script Name')
        fireEvent.change(outputs[0], { target: { value: 'VIVEK' } })

        // Fill Transcript
        fireEvent.change(screen.getByPlaceholderText(/Example:/), { target: { value: 'Vivek: Hello' } })

        // Click Import
        const importBtn = screen.getByText('Import Script')
        fireEvent.click(importBtn)

        // Verify parseTranscript called with correct args
        expect(parseTranscript).toHaveBeenCalledWith(
            'Vivek: Hello',
            expect.objectContaining({
                intExt: 'INT.',
                location: 'OFFICE',
                time: 'DAY'
            }),
            { 'Vivek': 'VIVEK' }
        )
        expect(mockOnImport).toHaveBeenCalled()
        expect(mockOnClose).toHaveBeenCalled()
    })

    it('disables import button if location or transcript missing', () => {
        render(<TranscriptImportDialog isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />)
        const importBtn = screen.getByText('Import Script')
        // Starts disabled
        expect(importBtn).toBeDisabled() // Logic check: we implemented check for disabled?
        // Let's check implementation: `disabled={!location || !transcript}`

        fireEvent.change(screen.getByPlaceholderText('LOCATION'), { target: { value: 'OFFICE' } })
        expect(importBtn).toBeDisabled()

        fireEvent.change(screen.getByPlaceholderText(/Example:/), { target: { value: 'Text' } })
        expect(importBtn).not.toBeDisabled()
    })
})
