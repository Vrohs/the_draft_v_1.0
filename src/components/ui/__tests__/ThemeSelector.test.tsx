import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeSelector } from '../ThemeSelector'
import { useUIStore } from '@/store/useUIStore'

describe('ThemeSelector', () => {
    beforeEach(() => {
        useUIStore.setState({ currentTheme: 'default' })
    })

    it('renders all theme options', () => {
        render(<ThemeSelector />)

        expect(screen.getByTitle('Classic')).toBeInTheDocument()
        expect(screen.getByTitle('Dawn')).toBeInTheDocument()
        expect(screen.getByTitle('Sepia')).toBeInTheDocument()
        expect(screen.getByTitle('Fog')).toBeInTheDocument()
        expect(screen.getByTitle('Forest')).toBeInTheDocument()
    })

    it('displays mood label', () => {
        render(<ThemeSelector />)

        expect(screen.getByText('Mood')).toBeInTheDocument()
    })

    it('highlights the current theme', () => {
        useUIStore.setState({ currentTheme: 'dawn' })

        render(<ThemeSelector />)

        const dawnButton = screen.getByTitle('Dawn')
        expect(dawnButton).toHaveClass('scale-110')
    })

    it('changes theme when clicked', () => {
        render(<ThemeSelector />)

        const sepiaButton = screen.getByTitle('Sepia')
        fireEvent.click(sepiaButton)

        expect(useUIStore.getState().currentTheme).toBe('sepia')
    })

    it('has accessible labels for all buttons', () => {
        render(<ThemeSelector />)

        expect(screen.getByLabelText('Select Classic theme')).toBeInTheDocument()
        expect(screen.getByLabelText('Select Dawn theme')).toBeInTheDocument()
        expect(screen.getByLabelText('Select Forest theme')).toBeInTheDocument()
    })
})
