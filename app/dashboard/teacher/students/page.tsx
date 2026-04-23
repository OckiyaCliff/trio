import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader } from '@/components/dashboard'
import { StudentsTable } from './students-table'

async function getTeacherStudents() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get teacher's classes
  const { data: classSubjects } = await supabase
    .from('class_subjects')
    .select('classes (id, name)')
    .eq('teacher_id', user.id)

  if (!classSubjects || classSubjects.length === 0) {
    return []
  }

  const classIds = classSubjects.map((cs: any) => {
    const cls = Array.isArray(cs.classes) ? cs.classes[0] : cs.classes
    return cls?.id
  }).filter(Boolean) as string[]
  const uniqueClassIds = [...new Set(classIds)]

  if (uniqueClassIds.length === 0) return []

  // Get students in those classes
  const { data: classStudents } = await supabase
    .from('class_students')
    .select(`
      class_id,
      classes (name),
      profiles!class_students_student_id_fkey (
        id,
        first_name,
        last_name,
        email,
        phone,
        avatar_url,
        role,
        created_at
      )
    `)
    .in('class_id', uniqueClassIds)

  // Transform the data
  const students: any[] = classStudents?.map((cs: any) => ({
    ...cs.profiles,
    className: Array.isArray(cs.classes) ? cs.classes[0]?.name : cs.classes?.name,
  })).filter(Boolean) || []

  return students
}

export default async function TeacherStudentsPage() {
  const students = await getTeacherStudents()

  if (!students) {
    redirect('/auth/login')
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/teacher' },
          { label: 'Students' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title="My Students"
          description="Students enrolled in your classes."
        />
        <StudentsTable data={students} />
      </div>
    </>
  )
}
