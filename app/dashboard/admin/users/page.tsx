import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader } from '@/components/dashboard'
import { UsersTable } from './users-table'

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
        <UsersTable data={users} />
      </div>
    </>
  )
}
