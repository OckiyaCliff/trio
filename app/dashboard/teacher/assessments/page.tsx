import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader } from '@/components/dashboard'
import { AssessmentsTable } from './assessments-table'

async function getTeacherAssessments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // First get teacher's class_subject IDs
  const { data: classSubjects } = await supabase
    .from('class_subjects')
    .select('id')
    .eq('teacher_id', user.id)

  if (!classSubjects || classSubjects.length === 0) {
    return []
  }

  const classSubjectIds = classSubjects.map(cs => cs.id)

  const { data: assessments } = await supabase
    .from('assessments')
    .select(`
      id,
      name,
      type,
      max_score,
      weight,
      due_date,
      created_at,
      class_subjects (
        classes (name),
        subjects (name)
      ),
      terms (name)
    `)
    .in('class_subject_id', classSubjectIds)
    .order('created_at', { ascending: false })

  return assessments || []
}

export default async function TeacherAssessmentsPage() {
  const assessments = await getTeacherAssessments()

  if (!assessments) {
    redirect('/auth/login')
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/teacher' },
          { label: 'Assessments' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title="Assessments"
          description="View and manage your assessments."
        />
        <AssessmentsTable data={assessments} />
      </div>
    </>
  )
}
