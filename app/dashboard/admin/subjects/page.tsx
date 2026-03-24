import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { SubjectsTable } from './subjects-table'
import { AddSubjectDialog } from './add-subject-dialog'

async function getSchoolSubjects() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()
  
  if (!profile?.school_id) return null

  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .eq('school_id', profile.school_id)
    .order('name', { ascending: true })

  return { subjects: subjects || [], schoolId: profile.school_id }
}

export default async function AdminSubjectsPage() {
  const data = await getSchoolSubjects()

  if (!data) {
    redirect('/auth/login')
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/admin' },
          { label: 'Subjects' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title="Subjects"
          description="Manage subjects taught at your school."
          actions={<AddSubjectDialog schoolId={data.schoolId} />}
        />
        <SubjectsTable subjects={data.subjects} />
      </div>
    </>
  )
}
