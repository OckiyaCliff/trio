import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader, DataTable, type Column } from '@/components/dashboard'
import { AddGradeDialog } from './add-grade-dialog'
import type { Grade } from '@/lib/types'

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

const columns: Column<Grade>[] = [
  {
    key: 'name',
    header: 'Grade Name',
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: 'level',
    header: 'Level',
    cell: (row) => row.level,
  },
  {
    key: 'created_at',
    header: 'Created',
    cell: (row) => new Date(row.created_at).toLocaleDateString(),
  },
]

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
        <DataTable
          columns={columns}
          data={data.grades}
          emptyMessage="No grades found"
          emptyDescription="Get started by adding your first grade level."
        />
      </div>
    </>
  )
}
