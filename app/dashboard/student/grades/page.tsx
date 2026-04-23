import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader } from '@/components/dashboard'
import { GradesTable } from './grades-table'

async function getStudentGrades() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: grades } = await supabase
    .from('scores')
    .select(`
      id,
      score,
      remarks,
      graded_at,
      assessments (
        name,
        type,
        max_score,
        class_subjects (
          subjects (name),
          classes (name)
        )
      )
    `)
    .eq('student_id', user.id)
    .order('graded_at', { ascending: false })

  return grades || []
}

export default async function StudentGradesPage() {
  const grades = await getStudentGrades()

  if (!grades) {
    redirect('/auth/login')
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/student' },
          { label: 'Grades' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title="My Grades"
          description="View your assessment scores and feedback."
        />
        <GradesTable data={grades} />
      </div>
    </>
  )
}
