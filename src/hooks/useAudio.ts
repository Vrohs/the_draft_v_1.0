import { useCallback, useEffect, useRef, useState } from 'react'
import { useUIStore } from '@/store/useUIStore'

export const useAudio = () => {
    const { isSoundEnabled } = useUIStore()
    const audioContextRef = useRef<AudioContext | null>(null)
    const buffersRef = useRef<{ [key: string]: AudioBuffer }>({})

    useEffect(() => {
        // Initialize AudioContext on user interaction usually, but here on mount
        const init = async () => {
            if (!window.AudioContext) return
            const ctx = new window.AudioContext()
            audioContextRef.current = ctx

            const loadBuffer = async (url: string) => {
                const response = await fetch(url)
                const arrayBuffer = await response.arrayBuffer()
                return await ctx.decodeAudioData(arrayBuffer)
            }

            try {
                const [clack, ret, slide] = await Promise.all([
                    loadBuffer('/sounds/clack.mp3'),
                    loadBuffer('/sounds/return.mp3'),
                    loadBuffer('/sounds/slide.mp3')
                ])
                buffersRef.current = { clack, return: ret, slide }
            } catch (e) {
                console.error("Failed to load sounds", e)
            }
        }
        init()

        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close()
            }
        }
    }, [])

    const playSound = useCallback((type: 'clack' | 'return' | 'slide', offset: number = 0, duration?: number) => {
        if (!isSoundEnabled || !audioContextRef.current || !buffersRef.current[type]) return

        const ctx = audioContextRef.current

        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => { })
        }

        const source = ctx.createBufferSource()
        source.buffer = buffersRef.current[type]

        const gainNode = ctx.createGain()

        const startTime = ctx.currentTime

        if (type === 'clack') {
            // ADSR Envelope for "polished" sound
            // Start silent
            gainNode.gain.setValueAtTime(0, startTime)
            // Quick attack to max volume (0.01s)
            gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.005)
            // Exponential decay to near silence
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
        // User requested from range 0:47 - 0:59
        // 47.6s usually has good single strokes in typewriter audio.
        // Duration 0.2s with the envelope above will fade it out nicely.
        playSound('clack', 47.6, 0.2)
    }, [playSound])

    const playReturn = useCallback(() => {
        playSound('return', 0)
    }, [playSound])

    // We need to support looping for slide.
    // The current playSound architecture handles one-shots.
    // We need a ref to stop the loop.
    const activeSlideSource = useRef<AudioBufferSourceNode | null>(null)

    const startSlide = useCallback(() => {
        if (!isSoundEnabled || !audioContextRef.current || !buffersRef.current.slide) return
        if (activeSlideSource.current) return // Already playing

        const ctx = audioContextRef.current
        if (ctx.state === 'suspended') ctx.resume()

        const source = ctx.createBufferSource()
        source.buffer = buffersRef.current.slide
        source.loop = true
        source.loopStart = 2.0 // 0:02
        source.loopEnd = 3.0   // 0:03

        const gainNode = ctx.createGain()
        gainNode.gain.value = 0.3

        source.connect(gainNode)
        gainNode.connect(ctx.destination)

        // Start anywhere in the loop? Or at loopStart?
        source.start(0, 2.0)
        activeSlideSource.current = source
    }, [isSoundEnabled])

    const stopSlide = useCallback(() => {
        if (activeSlideSource.current) {
            try {
                activeSlideSource.current.stop()
            } catch (e) {
                // ignore
            }
            activeSlideSource.current = null
        }
    }, [])

    // Expose start/stop instead of just "play"
    // But our hook interface expects "playSlide".
    // We'll map playSlide to startSlide for now, but we need meaningful stop logic in the scrolling hook.

    const playBell = useCallback(() => { }, [])

    return { playClack, playReturn, startSlide, stopSlide, playBell }
}
