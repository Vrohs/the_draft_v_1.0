'use client'

import { useUIStore, MoodTheme } from '@/store/useUIStore'

const themes: { id: MoodTheme; label: string; color: string }[] = [
    { id: 'default', label: 'Classic', color: '#FDFBF7' },
    { id: 'dawn', label: 'Dawn', color: '#FFE4D6' },
    { id: 'sepia', label: 'Sepia', color: '#F5E6D3' },
    { id: 'fog', label: 'Fog', color: '#E8EAED' },
    { id: 'forest', label: 'Forest', color: '#1C2A1C' },
]

export const ThemeSelector = () => {
    const { currentTheme, setTheme } = useUIStore()

    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-ink/40 uppercase tracking-wider">Mood</span>
            <div className="flex gap-2">
                {themes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => setTheme(theme.id)}
                        className={`
                            w-6 h-6 rounded-full border-2 transition-all duration-300
                            hover:scale-110 hover:shadow-md
                            ${currentTheme === theme.id
                                ? 'border-ink ring-2 ring-ink/20 scale-110'
                                : 'border-ink/20 hover:border-ink/40'
                            }
                        `}
                        style={{ backgroundColor: theme.color }}
                        title={theme.label}
                        aria-label={`Select ${theme.label} theme`}
                    />
                ))}
            </div>
        </div>
    )
}
