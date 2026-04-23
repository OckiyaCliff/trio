import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader } from '@/components/dashboard'
import { AddGradeDialog } from './add-grade-dialog'
import { GradesTable } from './grades-table'

async function getSchoolGrades() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) return null

  const { data: grades } = await supabase
    .from('grades')
    .select('*')
    .eq('school_id', profile.school_id)
    .order('level', { ascending: true })

  return { grades: grades || [], schoolId: profile.school_id }
}

export default async function AdminGradesPage() {
  const data = await getSchoolGrades()

  if (!data) {
    redirect('/auth/login')
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/admin' },
          { label: 'Grades' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title="Grades"
          description="Manage grade levels for your school."
          actions={<AddGradeDialog schoolId={data.schoolId} />}
        />
        <GradesTable data={data.grades} />
      </div>
    </>
  )
}
