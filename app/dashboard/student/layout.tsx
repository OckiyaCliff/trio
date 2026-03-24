import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar, type NavGroup } from '@/components/dashboard'
import {
  LayoutDashboard,
  School,
  ClipboardList,
  Award,
  Settings,
} from 'lucide-react'

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard/student',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: 'Academic',
    items: [
      {
        title: 'My Classes',
        href: '/dashboard/student/classes',
        icon: School,
      },
      {
        title: 'Assessments',
        href: '/dashboard/student/assessments',
        icon: ClipboardList,
      },
      {
        title: 'Grades',
        href: '/dashboard/student/grades',
        icon: Award,
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        title: 'Settings',
        href: '/dashboard/student/settings',
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

export default async function StudentLayout({
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
      <AppSidebar role="student" navGroups={navGroups} schoolName={school.name} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
