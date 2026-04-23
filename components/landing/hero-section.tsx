'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'

const LaserFlow = dynamic(() => import('@/components/ui/laser-flow'), { ssr: false })

export function HeroSection() {
    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
            {/* LaserFlow background */}
            <div className="absolute inset-0 pointer-events-auto">
                <LaserFlow
                    color="#8B5CF6"
                    horizontalBeamOffset={0.1}
                    verticalBeamOffset={0.0}
                    fogIntensity={0.45}
                    wispDensity={1}
                    flowSpeed={0.35}
                />
            </div>

            {/* Content overlay */}
            <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/60 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Now available
                </div>

                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                    Education Management
                    <br />
                    <span className="text-white/60">Made Simple</span>
                </h1>

                <p className="mt-6 text-base text-white/50 leading-relaxed max-w-lg mx-auto">
                    TRIO connects administrators, teachers, students, and parents
                    in one unified platform. Track performance, manage classes,
                    and streamline your school.
                </p>

                <div className="mt-10 flex items-center justify-center gap-3">
                    <Button size="lg" asChild className="bg-white text-black hover:bg-white/90 rounded-md font-medium px-8">
                        <Link href="/auth/sign-up">Get Started</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="border-white/20 text-white hover:bg-white/10 rounded-md font-medium px-8">
                        <Link href="/auth/login">Sign In</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
