'use client'

import { cn } from "@/lib/utils"

interface MagicBentoProps {
    className?: string
    children?: React.ReactNode
}

export function MagicBento({ className, children }: MagicBentoProps) {
    return (
        <div
            className={cn(
                "relative rounded-[2rem] border border-[#8B5CF6]/30 bg-black/40 backdrop-blur-xl overflow-hidden shadow-[0_0_50px_-12px_rgba(139,92,246,0.5)]",
                className
            )}
        >
            {/* Dotted Pattern */}
            <div
                className="absolute inset-0 opacity-[0.15]"
                style={{
                    backgroundImage: `radial-gradient(#8B5CF6 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Content */}
            <div className="relative z-10 w-full h-full p-8 flex flex-col items-center justify-center">
                {children}
            </div>

            {/* Decorative inner glow */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#8B5CF6]/50 to-transparent" />
        </div>
    )
}
