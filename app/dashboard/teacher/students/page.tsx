import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader, DataTable, type Column } from '@/components/dashboard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Profile } from '@/lib/types'

interface StudentWithClass extends Profile {
  className?: string
}

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

  const classIds = classSubjects.map(cs => cs.classes?.id).filter(Boolean) as string[]
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
  const students: StudentWithClass[] = classStudents?.map(cs => ({
    ...cs.profiles,
    className: cs.classes?.name,
  })).filter(Boolean) as StudentWithClass[] || []

  return students
}

const columns: Column<StudentWithClass>[] = [
  {
    key: 'name',
    header: 'Student',
    cell: (row) => {
      const initials = `${row.first_name?.[0] || ''}${row.last_name?.[0] || ''}`.toUpperCase()
      const name = `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Unknown'
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.avatar_url || ''} />
            <AvatarFallback>{initials || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      )
    },
  },
  {
    key: 'className',
    header: 'Class',
    cell: (row) => <Badge variant="outline">{row.className}</Badge>,
  },
  {
    key: 'phone',
    header: 'Phone',
    cell: (row) => row.phone || '-',
  },
]

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
        <DataTable
          columns={columns}
          data={students}
          emptyMessage="No students found"
          emptyDescription="No students are enrolled in your classes yet."
        />
      </div>
    </>
  )
}
