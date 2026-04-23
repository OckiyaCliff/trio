import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GraduationCap } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { HeroSection } from '@/components/landing/hero-section'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/[0.08] bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-screen-xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <GraduationCap className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white tracking-widest">TRIO</span>
          </Link>
          <nav className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              {['Product', 'Education', 'Scale'].map((item) => (
                <Link key={item} href="#" className="text-[13px] text-white/40 hover:text-white transition-colors">
                  {item}
                </Link>
              ))}
            </div>
            <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="sm" asChild className="h-8 text-white/60 hover:text-white hover:bg-white/5 text-[13px]">
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button size="sm" asChild className="h-8 bg-white text-black hover:bg-white/90 rounded-full text-[13px] font-semibold px-4">
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </div>
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
