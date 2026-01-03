'use client'

import { useUIStore } from '@/store/useUIStore'
import clsx from 'clsx'

export const FocusVignette = () => {
    const { isFocusMode, isNightMode } = useUIStore()

    return (
        <div
            className={clsx(
                "fixed inset-0 pointer-events-none z-40 transition-opacity duration-700",
                isFocusMode ? "opacity-100" : "opacity-0"
            )}
            aria-hidden="true"
        >
            <div
                className={clsx(
                    "absolute inset-0",
                    isNightMode
                        ? "bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)]"
                        : "bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.25)_100%)]"
                )}
            />
        </div>
    )
}
