import { createClient } from '@/lib/supabase/server'
import { DashboardHeader, PageHeader } from '@/components/dashboard'
import { UsersTable } from './users-table'

async function getAllUsers() {
    const supabase = await createClient()

    const { data: profiles } = await supabase
        .from('profiles')
        .select(`
      id,
      email,
      first_name,
      last_name,
      role,
      school_id,
      created_at,
      schools (name)
    `)
        .order('created_at', { ascending: false })

    return (profiles || []).map((p: any) => ({
        id: p.id,
        email: p.email || '',
        first_name: p.first_name,
        last_name: p.last_name,
        role: p.role,
        school_name: (Array.isArray(p.schools) ? p.schools[0] : p.schools)?.name || null,
        created_at: p.created_at,
    }))
}

export default async function SuperAdminUsersPage() {
    const users = await getAllUsers()

    return (
        <>
            <DashboardHeader
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard/super-admin' },
                    { label: 'Users' },
                ]}
            />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="All Users"
                    description={`Manage all ${users.length} users across the platform.`}
                />
                <UsersTable data={users} />
            </div>
        </>
    )
}
