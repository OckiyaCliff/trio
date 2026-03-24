import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader } from '@/components/dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { School, Award } from 'lucide-react'

interface ChildWithDetails {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  avatar_url: string | null
  relationship: string | null
  classes: {
    name: string
    grades: { name: string } | null
  }[]
  averageScore: number
  totalScores: number
}

async function getParentChildren() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

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

  if (!parentStudents) return []

  // Get detailed info for each child
  const children: ChildWithDetails[] = await Promise.all(
    parentStudents.map(async (ps) => {
      const childId = ps.profiles?.id
      if (!childId) return null

      // Get classes
      const { data: classStudents } = await supabase
        .from('class_students')
        .select('classes (name, grades (name))')
        .eq('student_id', childId)

      // Get scores
      const { data: scores } = await supabase
        .from('scores')
        .select('score, assessments (max_score)')
        .eq('student_id', childId)

      const totalScores = scores?.length || 0
      const averageScore = scores && scores.length > 0
        ? Math.round(
            scores.reduce((acc, s) => {
              if (s.score !== null && s.assessments?.max_score) {
                return acc + (s.score / s.assessments.max_score) * 100
              }
              return acc
            }, 0) / scores.length
          )
        : 0

      return {
        ...ps.profiles,
        relationship: ps.relationship,
        classes: classStudents?.map(cs => cs.classes).filter(Boolean) || [],
        averageScore,
        totalScores,
      }
    })
  )

  return children.filter(Boolean) as ChildWithDetails[]
}

export default async function ParentChildrenPage() {
  const children = await getParentChildren()

  if (!children) {
    redirect('/auth/login')
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/parent' },
          { label: 'My Children' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title="My Children"
          description="View detailed information about your children's education."
        />

        {children.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No children linked to your account. Contact your school administrator to link your children.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {children.map((child) => {
              const initials = `${child.first_name?.[0] || ''}${child.last_name?.[0] || ''}`.toUpperCase()
              const name = `${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Unknown'

              return (
                <Card key={child.id}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={child.avatar_url || ''} />
                        <AvatarFallback className="text-lg">{initials || 'S'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{name}</CardTitle>
                        <CardDescription>{child.email}</CardDescription>
                        {child.relationship && (
                          <Badge variant="outline" className="mt-1 capitalize">
                            {child.relationship}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <School className="h-4 w-4" />
                          <span className="text-sm font-medium">Classes</span>
                        </div>
                        {child.classes.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Not enrolled in any classes</p>
                        ) : (
                          <div className="space-y-1">
                            {child.classes.map((cls, i) => (
                              <p key={i} className="text-sm">
                                {cls.name} <span className="text-muted-foreground">({cls.grades?.name})</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Award className="h-4 w-4" />
                          <span className="text-sm font-medium">Performance</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold">{child.averageScore}%</p>
                          <p className="text-sm text-muted-foreground">
                            Average across {child.totalScores} assessments
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
