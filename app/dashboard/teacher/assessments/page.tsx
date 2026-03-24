import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader, DataTable, type Column } from '@/components/dashboard'
import { Badge } from '@/components/ui/badge'

interface AssessmentWithDetails {
  id: string
  name: string
  type: string
  max_score: number
  weight: number
  due_date: string | null
  created_at: string
  class_subjects: {
    classes: { name: string } | null
    subjects: { name: string } | null
  } | null
  terms: { name: string } | null
}

async function getTeacherAssessments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // First get teacher's class_subject IDs
  const { data: classSubjects } = await supabase
    .from('class_subjects')
    .select('id')
    .eq('teacher_id', user.id)

  if (!classSubjects || classSubjects.length === 0) {
    return []
  }

  const classSubjectIds = classSubjects.map(cs => cs.id)

  const { data: assessments } = await supabase
    .from('assessments')
    .select(`
      id,
      name,
      type,
      max_score,
      weight,
      due_date,
      created_at,
      class_subjects (
        classes (name),
        subjects (name)
      ),
      terms (name)
    `)
    .in('class_subject_id', classSubjectIds)
    .order('created_at', { ascending: false })

  return assessments || []
}

const typeColors: Record<string, string> = {
  exam: 'bg-red-100 text-red-700',
  quiz: 'bg-blue-100 text-blue-700',
  assignment: 'bg-green-100 text-green-700',
  project: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-700',
}

const columns: Column<AssessmentWithDetails>[] = [
  {
    key: 'name',
    header: 'Assessment',
    cell: (row) => (
      <div>
        <p className="font-medium">{row.name}</p>
        <p className="text-xs text-muted-foreground">
          {row.class_subjects?.classes?.name} - {row.class_subjects?.subjects?.name}
        </p>
      </div>
    ),
  },
  {
    key: 'type',
    header: 'Type',
    cell: (row) => (
      <Badge className={typeColors[row.type] || typeColors.other} variant="secondary">
        {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
      </Badge>
    ),
  },
  {
    key: 'max_score',
    header: 'Max Score',
    cell: (row) => row.max_score,
  },
  {
    key: 'weight',
    header: 'Weight',
    cell: (row) => `${row.weight}%`,
  },
  {
    key: 'term',
    header: 'Term',
    cell: (row) => row.terms?.name || '-',
  },
  {
    key: 'due_date',
    header: 'Due Date',
    cell: (row) => row.due_date ? new Date(row.due_date).toLocaleDateString() : '-',
  },
]

export default async function TeacherAssessmentsPage() {
  const assessments = await getTeacherAssessments()

  if (!assessments) {
    redirect('/auth/login')
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/teacher' },
          { label: 'Assessments' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title="Assessments"
          description="View and manage your assessments."
        />
        <DataTable
          columns={columns}
          data={assessments}
          emptyMessage="No assessments found"
          emptyDescription="You haven't created any assessments yet. You need to be assigned to classes first."
        />
      </div>
    </>
  )
}
