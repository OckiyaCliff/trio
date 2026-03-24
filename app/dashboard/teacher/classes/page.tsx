import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader } from '@/components/dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, BookOpen } from 'lucide-react'
import Link from 'next/link'

async function getTeacherClasses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: classSubjects } = await supabase
    .from('class_subjects')
    .select(`
      id,
      classes (
        id,
        name,
        grades (name),
        academic_years (name, is_current)
      ),
      subjects (name, code)
    `)
    .eq('teacher_id', user.id)

  // Get student counts for each class
  const classIds = classSubjects?.map(cs => cs.classes?.id).filter(Boolean) || []
  const uniqueClassIds = [...new Set(classIds)] as string[]

  const studentCounts: Record<string, number> = {}
  if (uniqueClassIds.length > 0) {
    const { data: students } = await supabase
      .from('class_students')
      .select('class_id')
      .in('class_id', uniqueClassIds)

    if (students) {
      students.forEach(s => {
        studentCounts[s.class_id] = (studentCounts[s.class_id] || 0) + 1
      })
    }
  }

  return { classSubjects: classSubjects || [], studentCounts }
}

export default async function TeacherClassesPage() {
  const data = await getTeacherClasses()

  if (!data) {
    redirect('/auth/login')
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/teacher' },
          { label: 'My Classes' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title="My Classes"
          description="View and manage the classes you teach."
        />

        {data.classSubjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                You have no classes assigned yet. Contact your school administrator to be assigned to classes.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.classSubjects.map((cs) => (
              <Card key={cs.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{cs.classes?.name}</CardTitle>
                      <CardDescription>{cs.classes?.grades?.name}</CardDescription>
                    </div>
                    {cs.classes?.academic_years?.is_current && (
                      <Badge>Current Year</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{cs.subjects?.name}</span>
                      {cs.subjects?.code && (
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {cs.subjects.code}
                        </code>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {data.studentCounts[cs.classes?.id || ''] || 0} students
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
