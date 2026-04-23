import { createClient } from '@/lib/supabase/server'
import { DashboardHeader, PageHeader, StatCard } from '@/components/dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

async function getAnalytics() {
    const supabase = await createClient()

    const [schoolsResult, profilesResult, classesResult, assessmentsResult] = await Promise.all([
        supabase.from('schools').select('id, is_active, created_at'),
        supabase.from('profiles').select('id, role, created_at'),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('assessments').select('id', { count: 'exact', head: true }),
    ])

    const schools = schoolsResult.data || []
    const profiles = profilesResult.data || []

    const roleCounts = profiles.reduce((acc, p) => {
        acc[p.role] = (acc[p.role] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const activeSchools = schools.filter((s) => s.is_active).length

    return {
        totalSchools: schools.length,
        activeSchools,
        inactiveSchools: schools.length - activeSchools,
        totalUsers: profiles.length,
        totalAdmins: roleCounts['school_admin'] || 0,
        totalTeachers: roleCounts['teacher'] || 0,
        totalStudents: roleCounts['student'] || 0,
        totalParents: roleCounts['parent'] || 0,
        totalClasses: classesResult.count || 0,
        totalAssessments: assessmentsResult.count || 0,
    }
}

export default async function SuperAdminAnalyticsPage() {
    const stats = await getAnalytics()

    return (
        <>
            <DashboardHeader
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard/super-admin' },
                    { label: 'Analytics' },
                ]}
            />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Platform Analytics"
                    description="Detailed metrics across the entire TRIO platform."
                />

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Schools" value={stats.totalSchools} description={`${stats.activeSchools} active`} icon="Building2" />
                    <StatCard title="Total Users" value={stats.totalUsers} description="Across all roles" icon="Users" />
                    <StatCard title="Total Classes" value={stats.totalClasses} description="Across all schools" icon="School" />
                    <StatCard title="Total Assessments" value={stats.totalAssessments} description="Created platform-wide" icon="ClipboardList" />
                </div>

                {/* User Distribution */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Distribution</CardTitle>
                            <CardDescription>Breakdown by role across all schools</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { label: 'School Admins', count: stats.totalAdmins, percentage: stats.totalUsers > 0 ? Math.round((stats.totalAdmins / stats.totalUsers) * 100) : 0 },
                                    { label: 'Teachers', count: stats.totalTeachers, percentage: stats.totalUsers > 0 ? Math.round((stats.totalTeachers / stats.totalUsers) * 100) : 0 },
                                    { label: 'Students', count: stats.totalStudents, percentage: stats.totalUsers > 0 ? Math.round((stats.totalStudents / stats.totalUsers) * 100) : 0 },
                                    { label: 'Parents', count: stats.totalParents, percentage: stats.totalUsers > 0 ? Math.round((stats.totalParents / stats.totalUsers) * 100) : 0 },
                                ].map((item) => (
                                    <div key={item.label} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>{item.label}</span>
                                            <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-secondary">
                                            <div className="h-2 rounded-full bg-foreground/20" style={{ width: `${item.percentage}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>School Status</CardTitle>
                            <CardDescription>Active vs inactive schools</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                        <span className="text-sm">Active Schools</span>
                                    </div>
                                    <span className="text-sm font-medium">{stats.activeSchools}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                                        <span className="text-sm">Inactive Schools</span>
                                    </div>
                                    <span className="text-sm font-medium">{stats.inactiveSchools}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
