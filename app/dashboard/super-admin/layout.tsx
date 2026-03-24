import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar, type NavGroup } from '@/components/dashboard'
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  BarChart3,
} from 'lucide-react'

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard/super-admin',
        icon: LayoutDashboard,
      },
      {
        title: 'Analytics',
        href: '/dashboard/super-admin/analytics',
        icon: BarChart3,
      },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        title: 'Schools',
        href: '/dashboard/super-admin/schools',
        icon: Building2,
      },
      {
        title: 'Users',
        href: '/dashboard/super-admin/users',
        icon: Users,
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        title: 'Settings',
        href: '/dashboard/super-admin/settings',
        icon: Settings,
      },
    ],
  },
]

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar role="super_admin" navGroups={navGroups} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
