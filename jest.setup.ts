import '@testing-library/jest-dom'

// Mock Web Audio API
class AudioContextMock {
    state = 'suspended'
    createBufferSource() {
        return {
            buffer: null,
            connect: jest.fn(),
            start: jest.fn(),
            stop: jest.fn(),
            playbackRate: { value: 1 },
            loop: false,
            loopStart: 0,
            loopEnd: 0
        }
    }
    createGain() {
        return {
            gain: {
                value: 1,
                setValueAtTime: jest.fn(),
                linearRampToValueAtTime: jest.fn(),
                exponentialRampToValueAtTime: jest.fn()
            },
            connect: jest.fn()
        }
    }
    decodeAudioData() {
        return Promise.resolve({})
    }
    resume() {
        return Promise.resolve()
    }
    close() {
        return Promise.resolve()
    }
}

// @ts-ignore
window.AudioContext = AudioContextMock
// @ts-ignore
window.webkitAudioContext = AudioContextMock

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// Mock window.scrollTo
window.scrollTo = jest.fn()

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}
