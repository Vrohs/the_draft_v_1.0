import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SettingsDialog } from '../SettingsDialog'
import { useUIStore } from '@/store/useUIStore'
import { db } from '@/lib/db'

// Mock dependencies
jest.mock('@/store/useUIStore', () => ({
    useUIStore: jest.fn()
}))

// Mock DB
jest.mock('@/lib/db', () => ({
    db: {
        scripts: {
            update: jest.fn().mockResolvedValue(1)
        }
    }
}))

describe('SettingsDialog', () => {
    const mockSetScriptTitle = jest.fn()
    const mockSetScriptAuthor = jest.fn()
    const mockOnClose = jest.fn()

    const defaultStore = {
        scriptTitle: 'Test Script',
        setScriptTitle: mockSetScriptTitle,
        scriptAuthor: 'Test Author',
        setScriptAuthor: mockSetScriptAuthor,
        currentScriptId: 1,
        isNightMode: false
    }

    beforeEach(() => {
        jest.clearAllMocks()
        // @ts-expect-error Mocking partial store for testing
        useUIStore.mockImplementation(() => defaultStore)
    })

    it('renders with initial values from store', () => {
        render(<SettingsDialog isOpen={true} onClose={mockOnClose} />)

        expect(screen.getByDisplayValue('Test Script')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Test Author')).toBeInTheDocument()
    })

    it('updates local state on input change', () => {
        render(<SettingsDialog isOpen={true} onClose={mockOnClose} />)

        const titleInput = screen.getByDisplayValue('Test Script')
        fireEvent.change(titleInput, { target: { value: 'New Title' } })

        expect(titleInput).toHaveValue('New Title')
        // Store should NOT be called yet
        expect(mockSetScriptTitle).not.toHaveBeenCalled()
    })

    it('saves changes to store and DB', async () => {
        render(<SettingsDialog isOpen={true} onClose={mockOnClose} />)

        // Change values
        fireEvent.change(screen.getByDisplayValue('Test Script'), { target: { value: 'Updated Title' } })
        fireEvent.change(screen.getByDisplayValue('Test Author'), { target: { value: 'Updated Author' } })

        // Click Save
        fireEvent.click(screen.getByText('Save'))

        // Verify Save actions
        await waitFor(() => {
            expect(mockSetScriptTitle).toHaveBeenCalledWith('Updated Title')
            expect(mockSetScriptAuthor).toHaveBeenCalledWith('Updated Author')
            expect(db.scripts.update).toHaveBeenCalledWith(1, expect.objectContaining({
                title: 'Updated Title',
                author: 'Updated Author'
            }))
            expect(mockOnClose).toHaveBeenCalled()
        })
    })

    it('does not save to DB if no script loaded', async () => {
        // @ts-expect-error Mocking partial store for testing
        useUIStore.mockImplementation(() => ({
            ...defaultStore,
            currentScriptId: null
        }))

        render(<SettingsDialog isOpen={true} onClose={mockOnClose} />)

        fireEvent.change(screen.getByDisplayValue('Test Script'), { target: { value: 'New' } })
        fireEvent.click(screen.getByText('Save'))

        await waitFor(() => {
            expect(mockSetScriptTitle).toHaveBeenCalledWith('New')
            expect(db.scripts.update).not.toHaveBeenCalled()
            expect(mockOnClose).toHaveBeenCalled()
        })
    })

    it('closes without saving on cancel', () => {
        render(<SettingsDialog isOpen={true} onClose={mockOnClose} />)

        fireEvent.change(screen.getByDisplayValue('Test Script'), { target: { value: 'Changed' } })
        fireEvent.click(screen.getByText('Cancel'))

        expect(mockSetScriptTitle).not.toHaveBeenCalled()
        expect(db.scripts.update).not.toHaveBeenCalled()
        expect(mockOnClose).toHaveBeenCalled()
    })

    it('does not render when not open', () => {
        const { container } = render(<SettingsDialog isOpen={false} onClose={mockOnClose} />)
        expect(container).toBeEmptyDOMElement()
    })
})
