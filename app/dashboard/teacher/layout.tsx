import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar, type NavGroup } from '@/components/dashboard'

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard/teacher',
        icon: 'LayoutDashboard',
      },
    ],
  },
  {
    label: 'Teaching',
    items: [
      {
        title: 'My Classes',
        href: '/dashboard/teacher/classes',
        icon: 'School',
      },
      {
        title: 'Assessments',
        href: '/dashboard/teacher/assessments',
        icon: 'ClipboardList',
      },
      {
        title: 'Students',
        href: '/dashboard/teacher/students',
        icon: 'GraduationCap',
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        title: 'Settings',
        href: '/dashboard/teacher/settings',
        icon: 'Settings',
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

export default async function TeacherLayout({
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
      <AppSidebar role="teacher" navGroups={navGroups} schoolName={school.name} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
