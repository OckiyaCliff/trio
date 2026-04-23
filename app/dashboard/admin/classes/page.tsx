import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { ClassesTable } from './classes-table'

async function getSchoolClasses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) return null

  const { data: classes } = await supabase
    .from('classes')
    .select(`
      id,
      name,
      capacity,
      created_at,
      grades (name),
      academic_years (name, is_current)
    `)
    .eq('school_id', profile.school_id)
    .order('name', { ascending: true })

  return classes || []
}

export default async function AdminClassesPage() {
  const classes = await getSchoolClasses()

  if (!classes) {
    redirect('/auth/login')
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/admin' },
          { label: 'Classes' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title="Classes"
          description="Manage classes and student enrollments."
          actions={
            <Button asChild>
              <Link href="/dashboard/admin/classes/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Link>
            </Button>
          }
        />
        <ClassesTable data={classes} />
      </div>
    </>
  )
}
