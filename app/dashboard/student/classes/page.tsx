import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader } from '@/components/dashboard'
import { StudentClassesTable } from './classes-table'

async function getStudentClasses() {
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

    // Get class details
    const { data: classes } = await supabase
        .from('classes')
        .select(`
      id,
      name,
      capacity,
      created_at,
      grades (name),
      academic_years (name, is_current),
      class_subjects (id),
      profiles!classes_class_teacher_id_fkey (first_name, last_name)
    `)
        .in('id', classIds)
        .order('name', { ascending: true })

    // Transform to add computed fields
    const result = (classes || []).map((c: any) => {
        const teacher = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
        const subjects = Array.isArray(c.class_subjects) ? c.class_subjects : [];
        return {
            ...c,
            subjectCount: subjects.length,
            classTeacher: teacher,
        };
    });

    return result
}

export default async function StudentClassesPage() {
    const classes = await getStudentClasses()

    if (!classes) {
        redirect('/auth/login')
    }

    return (
        <>
            <DashboardHeader
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard/student' },
                    { label: 'My Classes' },
                ]}
            />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="My Classes"
                    description="View the classes you are enrolled in and their details."
                />
                <StudentClassesTable data={classes} />
            </div>
        </>
    )
}
