import { useCallback, useEffect } from 'react'
import { useUIStore } from '@/store/useUIStore'

// Singleton State
let audioContext: AudioContext | null = null
let buffers: { [key: string]: AudioBuffer } = {}
let initPromise: Promise<void> | null = null
let activeSlideSource: AudioBufferSourceNode | null = null

const initAudio = async () => {
    if (typeof window === 'undefined') return
    if (initPromise) return initPromise
    if (!window.AudioContext && !(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext) return

    initPromise = (async () => {
        try {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
            audioContext = new AudioContextClass()

            const loadBuffer = async (url: string) => {
                const response = await fetch(url)
                const arrayBuffer = await response.arrayBuffer()
                if (!audioContext) return null
                return await audioContext.decodeAudioData(arrayBuffer)
            }

            const [clack, ret, slide] = await Promise.all([
                loadBuffer('/sounds/clack.mp3'),
                loadBuffer('/sounds/return.mp3'),
                loadBuffer('/sounds/slide.mp3')
            ])

            if (clack && ret && slide) {
                buffers = { clack, return: ret, slide }
            }
        } catch (e) {
            console.error("Failed to load sounds", e)
        }
    })()

    return initPromise
}

export const useAudio = () => {
    const { isSoundEnabled } = useUIStore()

    useEffect(() => {
        initAudio()
    }, [])

    const playSound = useCallback((type: 'clack' | 'return' | 'slide', offset: number = 0, duration?: number) => {
        if (!isSoundEnabled || !audioContext || !buffers[type]) return

        const ctx = audioContext
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => { })
        }

        const source = ctx.createBufferSource()
        source.buffer = buffers[type]
        const gainNode = ctx.createGain()
        const startTime = ctx.currentTime

        if (type === 'clack') {
            gainNode.gain.setValueAtTime(0, startTime)
            gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.005)
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + (duration || 0.2))
            source.playbackRate.value = 0.95 + Math.random() * 0.1
        } else if (type === 'return') {
            gainNode.gain.value = 0.6
        } else if (type === 'slide') {
            gainNode.gain.value = 0.3
        }

        source.connect(gainNode)
        gainNode.connect(ctx.destination)

        if (duration) {
            source.start(0, offset, duration)
        } else {
            source.start(0, offset)
        }
    }, [isSoundEnabled])

    const playClack = useCallback(() => {
        playSound('clack', 47.6, 0.2)
    }, [playSound])

    const playReturn = useCallback(() => {
        playSound('return', 0)
    }, [playSound])

    const startSlide = useCallback(() => {
        if (!isSoundEnabled || !audioContext || !buffers.slide) return
        if (activeSlideSource) return // Global slide already playing

        const ctx = audioContext
        if (ctx.state === 'suspended') ctx.resume().catch(() => { })

        const source = ctx.createBufferSource()
        source.buffer = buffers.slide
        source.loop = true
        source.loopStart = 2.0
        source.loopEnd = 3.0

        const gainNode = ctx.createGain()
        gainNode.gain.value = 0.3

        source.connect(gainNode)
        gainNode.connect(ctx.destination)

        source.start(0, 2.0)
        activeSlideSource = source

        // Safeguard: stop after 5 seconds max if something goes wrong with stopSlide
        // (Optional, maybe annoying if scrolling long? Let's relying on stopSlide)
    }, [isSoundEnabled])

    const stopSlide = useCallback(() => {
        if (activeSlideSource) {
            try {
                activeSlideSource.stop()
            } catch {
                // ignore
            }
            activeSlideSource = null
        }
    }, [])

    const playBell = useCallback(() => { }, [])

    return { playClack, playReturn, startSlide, stopSlide, playBell }
}
