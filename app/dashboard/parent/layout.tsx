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
        href: '/dashboard/parent',
        icon: 'LayoutDashboard',
      },
    ],
  },
  {
    label: 'Family',
    items: [
      {
        title: 'My Children',
        href: '/dashboard/parent/children',
        icon: 'Users',
      },
      {
        title: 'Grades',
        href: '/dashboard/parent/grades',
        icon: 'Award',
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        title: 'Settings',
        href: '/dashboard/parent/settings',
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

export default async function ParentLayout({
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
      <AppSidebar role="parent" navGroups={navGroups} schoolName={school.name} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
