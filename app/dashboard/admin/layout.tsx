import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar, type NavGroup } from '@/components/dashboard'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Settings,
  School,
} from 'lucide-react'

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard/admin',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: 'Academic',
    items: [
      {
        title: 'Academic Years',
        href: '/dashboard/admin/academic-years',
        icon: Calendar,
      },
      {
        title: 'Grades',
        href: '/dashboard/admin/grades',
        icon: GraduationCap,
      },
      {
        title: 'Subjects',
        href: '/dashboard/admin/subjects',
        icon: BookOpen,
      },
      {
        title: 'Classes',
        href: '/dashboard/admin/classes',
        icon: School,
      },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        title: 'Users',
        href: '/dashboard/admin/users',
        icon: Users,
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        title: 'Settings',
        href: '/dashboard/admin/settings',
        icon: Settings,
      },
    ],
  },
]

async function getSchoolInfo() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()
  
  if (!profile?.school_id) return null
  
  const { data: school } = await supabase
    .from('schools')
    .select('name')
    .eq('id', profile.school_id)
    .single()
  
  return school
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const school = await getSchoolInfo()
  
  if (!school) {
    redirect('/auth/login')
  }

  return (
    <SidebarProvider>
      <AppSidebar role="admin" navGroups={navGroups} schoolName={school.name} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
