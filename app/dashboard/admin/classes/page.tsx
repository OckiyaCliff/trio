import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader, DataTable, type Column } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import Link from 'next/link'

interface ClassWithDetails {
  id: string
  name: string
  capacity: number | null
  created_at: string
  grades: { name: string } | null
  academic_years: { name: string; is_current: boolean } | null
}

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

const columns: Column<ClassWithDetails>[] = [
  {
    key: 'name',
    header: 'Class Name',
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: 'grade',
    header: 'Grade',
    cell: (row) => row.grades?.name || '-',
  },
  {
    key: 'academic_year',
    header: 'Academic Year',
    cell: (row) => (
      <div className="flex items-center gap-2">
        <span>{row.academic_years?.name || '-'}</span>
        {row.academic_years?.is_current && (
          <Badge variant="secondary" className="text-xs">Current</Badge>
        )}
      </div>
    ),
  },
  {
    key: 'capacity',
    header: 'Capacity',
    cell: (row) => row.capacity || '-',
  },
  {
    key: 'created_at',
    header: 'Created',
    cell: (row) => new Date(row.created_at).toLocaleDateString(),
  },
]

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
        <DataTable
          columns={columns}
          data={classes}
          emptyMessage="No classes found"
          emptyDescription="Create grades and academic years first, then add classes."
        />
      </div>
    </>
  )
}
