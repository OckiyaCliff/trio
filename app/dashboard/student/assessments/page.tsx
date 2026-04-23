import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader } from '@/components/dashboard'
import { StudentAssessmentsTable } from './assessments-table'

async function getStudentAssessments() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get student's class enrollments
    const { data: enrollments } = await supabase
        .from('class_students')
        .select('class_id')
        .eq('student_id', user.id)

    if (!enrollments || enrollments.length === 0) return []

    const classIds = enrollments.map((e: any) => e.class_id).filter(Boolean)

    // Get class_subject IDs for the student's classes
    const { data: classSubjects } = await supabase
        .from('class_subjects')
        .select('id')
        .in('class_id', classIds)

    if (!classSubjects || classSubjects.length === 0) return []

    const classSubjectIds = classSubjects.map((cs: any) => cs.id)

    // Get assessments for those class_subjects
    const { data: assessments } = await supabase
        .from('assessments')
        .select(`
      id,
      name,
      type,
      max_score,
      due_date,
      description,
      created_at,
      class_subjects (
        subjects (name),
        classes (name)
      )
    `)
        .in('class_subject_id', classSubjectIds)
        .order('due_date', { ascending: false, nullsFirst: false })

    if (!assessments || assessments.length === 0) return []

    // Get student's scores for these assessments
    const assessmentIds = assessments.map((a: any) => a.id)
    const { data: scores } = await supabase
        .from('scores')
        .select('assessment_id, score')
        .eq('student_id', user.id)
        .in('assessment_id', assessmentIds)

    // Build a score lookup map
    const scoreMap = new Map<string, number>()
    scores?.forEach((s: any) => {
        if (s.score !== null) scoreMap.set(s.assessment_id, s.score)
    })

    // Merge scores into assessments
    const result = assessments.map((a: any) => ({
        ...a,
        studentScore: scoreMap.has(a.id) ? scoreMap.get(a.id) : null,
    }))

    return result
}

export default async function StudentAssessmentsPage() {
    const assessments = await getStudentAssessments()

    if (!assessments) {
        redirect('/auth/login')
    }

    return (
        <>
            <DashboardHeader
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard/student' },
                    { label: 'Assessments' },
                ]}
            />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Assessments"
                    description="View your upcoming and past assessments with scores."
                />
                <StudentAssessmentsTable data={assessments} />
            </div>
        </>
    )
}
