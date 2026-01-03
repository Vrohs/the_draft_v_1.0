'use client'

import { useRef, useEffect } from 'react'
import { useUIStore, AmbientSound } from '@/store/useUIStore'
import clsx from 'clsx'

const SOUND_URLS: Record<AmbientSound, string | null> = {
    none: null,
    rain: 'https://cdn.freesound.org/previews/531/531947_9497060-lq.mp3',
    fireplace: 'https://cdn.freesound.org/previews/499/499078_2178133-lq.mp3',
    birds: 'https://cdn.freesound.org/previews/586/586364_11058972-lq.mp3',
    coffee: 'https://cdn.freesound.org/previews/454/454640_2188-lq.mp3',
}

const SOUND_LABELS: Record<AmbientSound, string> = {
    none: '🔇',
    rain: '🌧️',
    fireplace: '🔥',
    birds: '🐦',
    coffee: '☕',
}

export const AmbientPlayer = () => {
    const {
        ambientSound,
        setAmbientSound,
        ambientVolume,
        setAmbientVolume,
        isReflectionMode
    } = useUIStore()

    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio()
            audioRef.current.loop = true
        }

        const audio = audioRef.current
        const soundUrl = SOUND_URLS[ambientSound]

        if (soundUrl && isReflectionMode) {
            audio.src = soundUrl
            audio.volume = ambientVolume
            audio.play().catch(() => {
                console.log('Audio autoplay blocked - click to enable')
            })
        } else {
            audio.pause()
            audio.src = ''
        }

        return () => {
            audio.pause()
        }
    }, [ambientSound, isReflectionMode])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = ambientVolume
        }
    }, [ambientVolume])

    if (!isReflectionMode) return null

    const sounds: AmbientSound[] = ['none', 'rain', 'fireplace', 'birds', 'coffee']

    return (
        <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-ink/40 uppercase tracking-wider">Ambience</span>

            <div className="flex gap-1">
                {sounds.map((sound) => (
                    <button
                        key={sound}
                        onClick={() => setAmbientSound(sound)}
                        className={clsx(
                            "w-8 h-8 rounded-lg text-lg transition-all duration-200",
                            "hover:scale-110",
                            ambientSound === sound
                                ? "bg-ink/10 ring-1 ring-ink/30"
                                : "hover:bg-ink/5"
                        )}
                        title={sound === 'none' ? 'Silence' : sound.charAt(0).toUpperCase() + sound.slice(1)}
                    >
                        {SOUND_LABELS[sound]}
                    </button>
                ))}
            </div>

            {ambientSound !== 'none' && (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-ink/40">Vol</span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={ambientVolume}
                        onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-ink/10 rounded-full appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-3
                            [&::-webkit-slider-thumb]:h-3
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-ink/60
                            [&::-webkit-slider-thumb]:hover:bg-ink"
                    />
                </div>
            )}
        </div>
    )
}
