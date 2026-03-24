import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, StatCard, PageHeader } from '@/components/dashboard'
import { Users, School, Award, BookOpen } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

async function getParentStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, school_id')
    .eq('id', user.id)
    .single()
  
  if (!profile) return null

  // Get linked children
  const { data: parentStudents } = await supabase
    .from('parent_students')
    .select(`
      relationship,
      profiles!parent_students_student_id_fkey (
        id,
        first_name,
        last_name,
        email,
        avatar_url
      )
    `)
    .eq('parent_id', user.id)

  const children = parentStudents?.map(ps => ({
    ...ps.profiles,
    relationship: ps.relationship,
  })) || []

  // Get total classes and scores for all children
  const childIds = children.map(c => c.id).filter(Boolean)
  
  let totalClasses = 0
  let totalScores = 0
  let averageScore = 0

  if (childIds.length > 0) {
    const { count: classCount } = await supabase
      .from('class_students')
      .select('id', { count: 'exact', head: true })
      .in('student_id', childIds)
    totalClasses = classCount || 0

    const { data: scores } = await supabase
      .from('scores')
      .select('score, assessments (max_score)')
      .in('student_id', childIds)

    totalScores = scores?.length || 0
    if (scores && scores.length > 0) {
      averageScore = Math.round(
        scores.reduce((acc, s) => {
          if (s.score !== null && s.assessments?.max_score) {
            return acc + (s.score / s.assessments.max_score) * 100
          }
          return acc
        }, 0) / scores.length
      )
    }
  }

  const { data: school } = await supabase
    .from('schools')
    .select('name')
    .eq('id', profile.school_id)
    .single()

  return {
    profile,
    school,
    children,
    totalChildren: children.length,
    totalClasses,
    totalScores,
    averageScore,
  }
}

export default async function ParentDashboard() {
  const stats = await getParentStats()

  if (!stats) {
    redirect('/auth/login')
  }

  const parentName = `${stats.profile.first_name || ''} ${stats.profile.last_name || ''}`.trim() || 'Parent'

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/parent' },
          { label: 'Overview' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title={`Welcome, ${parentName}`}
          description="Monitor your children's academic progress and performance."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Children"
            value={stats.totalChildren}
            description="Linked students"
            icon={Users}
          />
          <StatCard
            title="Classes"
            value={stats.totalClasses}
            description="Total enrollments"
            icon={School}
          />
          <StatCard
            title="Assessments"
            value={stats.totalScores}
            description="Graded assessments"
            icon={BookOpen}
          />
          <StatCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            description="Overall average"
            icon={Award}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Children</CardTitle>
            <CardDescription>Students linked to your account</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.children.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No children linked to your account yet. Contact your school administrator to link your children.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.children.map((child, i) => {
                  const initials = `${child.first_name?.[0] || ''}${child.last_name?.[0] || ''}`.toUpperCase()
                  const name = `${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Unknown'
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-4 rounded-lg border p-4"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={child.avatar_url || ''} />
                        <AvatarFallback>{initials || 'S'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{name}</p>
                        <p className="text-sm text-muted-foreground">{child.email}</p>
                        {child.relationship && (
                          <p className="text-xs text-muted-foreground capitalize">
                            {child.relationship}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
