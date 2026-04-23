import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GraduationCap } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { HeroSection } from '@/components/landing/hero-section'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-white" />
            <span className="text-base font-semibold text-white tracking-tight">TRIO</span>
          </Link>
          <nav className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="text-white/70 hover:text-white hover:bg-white/10">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild className="bg-white text-black hover:bg-white/90 rounded-md text-sm font-medium">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero with LaserFlow */}
      <main className="flex-1">
        <HeroSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-6">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-white/40" />
            <span className="text-sm text-white/40">TRIO</span>
          </div>
          <p className="text-sm text-white/40">
            Built for educators.
          </p>
        </div>
      </footer>
    </div>
  )
}
