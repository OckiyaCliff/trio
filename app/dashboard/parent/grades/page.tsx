import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader } from '@/components/dashboard'
import { GradesTable } from './grades-table'

async function getParentGrades() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: parentStudents } = await supabase
        .from('parent_students')
        .select(`
      profiles!parent_students_student_id_fkey (
        id,
        first_name,
        last_name
      )
    `)
        .eq('parent_id', user.id)

    if (!parentStudents || parentStudents.length === 0) return []

    const allGrades: any[] = []

    for (const ps of parentStudents) {
        const child = Array.isArray(ps.profiles) ? ps.profiles[0] : ps.profiles
        if (!child) continue

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
            subjects (name)
          )
        )
      `)
            .eq('student_id', child.id)
            .order('graded_at', { ascending: false })

        if (grades) {
            const childName = `${child.first_name} ${child.last_name}`
            allGrades.push(...grades.map(g => ({ ...g, childName })))
        }
    }

    return allGrades
}

export default async function ParentGradesPage() {
    const grades = await getParentGrades()

    if (!grades) {
        redirect('/auth/login')
    }

    return (
        <>
            <DashboardHeader
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard/parent' },
                    { label: 'Grades' },
                ]}
            />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Children's Grades"
                    description="View assessment scores and feedback for all your children."
                />
                <GradesTable data={grades} />
            </div>
        </>
    )
}
