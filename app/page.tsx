import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GraduationCap, Users, BookOpen, BarChart3, Shield, Zap } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Multi-Role Support',
    description: 'Separate dashboards for administrators, teachers, students, and parents.',
  },
  {
    icon: BookOpen,
    title: 'Class Management',
    description: 'Organize classes, subjects, and student enrollments effortlessly.',
  },
  {
    icon: BarChart3,
    title: 'Performance Tracking',
    description: 'Track assessments, grades, and academic progress in real-time.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Role-based access control ensures data privacy for all users.',
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'Instant notifications for grades, assignments, and announcements.',
  },
  {
    icon: GraduationCap,
    title: 'Academic Calendar',
    description: 'Manage academic years, terms, and important school events.',
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">TRIO</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
              Education Management Made Simple
            </h1>
            <p className="mt-6 text-lg text-muted-foreground text-balance">
              TRIO is a comprehensive school management platform that connects
              administrators, teachers, students, and parents in one unified system.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">TRIO Education Platform</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with care for educators everywhere.
          </p>
        </div>
      </footer>
    </div>
  )
}
