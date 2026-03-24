import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader, DataTable, type Column } from '@/components/dashboard'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ROLE_LABELS, type Profile } from '@/lib/types'

async function getSchoolUsers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()
  
  if (!profile?.school_id) return null

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .eq('school_id', profile.school_id)
    .order('created_at', { ascending: false })

  return users || []
}

const columns: Column<Profile>[] = [
  {
    key: 'name',
    header: 'User',
    cell: (row) => {
      const initials = `${row.first_name?.[0] || ''}${row.last_name?.[0] || ''}`.toUpperCase()
      const name = `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Unknown'
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.avatar_url || ''} />
            <AvatarFallback>{initials || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      )
    },
  },
  {
    key: 'role',
    header: 'Role',
    cell: (row) => (
      <Badge variant="outline">{ROLE_LABELS[row.role]}</Badge>
    ),
  },
  {
    key: 'phone',
    header: 'Phone',
    cell: (row) => row.phone || '-',
  },
  {
    key: 'created_at',
    header: 'Joined',
    cell: (row) => new Date(row.created_at).toLocaleDateString(),
  },
]

export default async function AdminUsersPage() {
  const users = await getSchoolUsers()

  if (!users) {
    redirect('/auth/login')
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/admin' },
          { label: 'Users' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title="Users"
          description="View all users in your school."
        />
        <DataTable
          columns={columns}
          data={users}
          emptyMessage="No users found"
          emptyDescription="Users will appear here once they register with your school code."
        />
      </div>
    </>
  )
}
