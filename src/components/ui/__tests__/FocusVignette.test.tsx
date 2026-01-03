import { render, screen } from '@testing-library/react'
import { FocusVignette } from '../FocusVignette'
import { useUIStore } from '@/store/useUIStore'

describe('FocusVignette', () => {
    beforeEach(() => {
        useUIStore.setState({ isFocusMode: false, isNightMode: false })
    })

    it('renders but is hidden when focus mode is off', () => {
        render(<FocusVignette />)

        const vignette = document.querySelector('[aria-hidden="true"]')
        expect(vignette).toBeInTheDocument()
        expect(vignette).toHaveClass('opacity-0')
    })

    it('becomes visible when focus mode is on', () => {
        useUIStore.setState({ isFocusMode: true })

        render(<FocusVignette />)

        const vignette = document.querySelector('[aria-hidden="true"]')
        expect(vignette).toBeInTheDocument()
        expect(vignette).toHaveClass('opacity-100')
    })

    it('has pointer-events-none to not block typing', () => {
        useUIStore.setState({ isFocusMode: true })

        render(<FocusVignette />)

        const vignette = document.querySelector('[aria-hidden="true"]')
        expect(vignette).toHaveClass('pointer-events-none')
    })

    it('uses radial gradient in day mode', () => {
        useUIStore.setState({ isFocusMode: true, isNightMode: false })

        render(<FocusVignette />)

        // Check inner gradient div has day mode gradient class
        const gradientDiv = document.querySelector('[aria-hidden="true"] > div')
        expect(gradientDiv).toHaveClass('bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.25)_100%)]')
    })

    it('uses darker gradient in night mode', () => {
        useUIStore.setState({ isFocusMode: true, isNightMode: true })

        render(<FocusVignette />)

        const gradientDiv = document.querySelector('[aria-hidden="true"] > div')
        expect(gradientDiv).toHaveClass('bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)]')
    })

    it('has proper z-index for layering above content', () => {
        useUIStore.setState({ isFocusMode: true })

        render(<FocusVignette />)

        const vignette = document.querySelector('[aria-hidden="true"]')
        expect(vignette).toHaveClass('z-40')
    })

    it('transitions smoothly with duration class', () => {
        render(<FocusVignette />)

        const vignette = document.querySelector('[aria-hidden="true"]')
        expect(vignette).toHaveClass('transition-opacity', 'duration-700')
    })
})
