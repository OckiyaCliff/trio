import { createClient } from '@/lib/supabase/server'
import { DashboardHeader, StatCard, PageHeader } from '@/components/dashboard'
import { Building2, Users, GraduationCap, BookOpen } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

async function getStats() {
  const supabase = await createClient()

  const [schoolsResult, profilesResult] = await Promise.all([
    supabase.from('schools').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id, role'),
  ])

  const profiles = profilesResult.data || []
  const roleCounts = profiles.reduce((acc, p) => {
    acc[p.role] = (acc[p.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalSchools: schoolsResult.count || 0,
    totalUsers: profiles.length,
    totalAdmins: roleCounts['admin'] || 0,
    totalTeachers: roleCounts['teacher'] || 0,
    totalStudents: roleCounts['student'] || 0,
    totalParents: roleCounts['parent'] || 0,
  }
}

async function getRecentSchools() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('schools')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return data || []
}

export default async function SuperAdminDashboard() {
  const stats = await getStats()
  const recentSchools = await getRecentSchools()

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/super-admin' },
          { label: 'Overview' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title="Platform Overview"
          description="Monitor and manage all schools across the TRIO platform."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Schools"
            value={stats.totalSchools}
            description="Active schools"
            icon={Building2}
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            description="Across all roles"
            icon={Users}
          />
          <StatCard
            title="Students"
            value={stats.totalStudents}
            description="Enrolled students"
            icon={GraduationCap}
          />
          <StatCard
            title="Teachers"
            value={stats.totalTeachers}
            description="Active teachers"
            icon={BookOpen}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Breakdown by role across all schools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'School Admins', count: stats.totalAdmins, color: 'bg-chart-1' },
                  { label: 'Teachers', count: stats.totalTeachers, color: 'bg-chart-2' },
                  { label: 'Students', count: stats.totalStudents, color: 'bg-chart-3' },
                  { label: 'Parents', count: stats.totalParents, color: 'bg-chart-4' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Schools</CardTitle>
              <CardDescription>Newly registered schools</CardDescription>
            </CardHeader>
            <CardContent>
              {recentSchools.length === 0 ? (
                <p className="text-sm text-muted-foreground">No schools registered yet.</p>
              ) : (
                <div className="space-y-4">
                  {recentSchools.map((school) => (
                    <div key={school.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{school.name}</p>
                        <p className="text-xs text-muted-foreground">Code: {school.code}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          school.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {school.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
