import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader, DataTable, type Column } from '@/components/dashboard'
import { Badge } from '@/components/ui/badge'

interface GradeWithDetails {
  id: string
  score: number | null
  remarks: string | null
  graded_at: string
  assessments: {
    name: string
    type: string
    max_score: number
    class_subjects: {
      subjects: { name: string } | null
      classes: { name: string } | null
    } | null
  } | null
}

async function getStudentGrades() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

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
          subjects (name),
          classes (name)
        )
      )
    `)
    .eq('student_id', user.id)
    .order('graded_at', { ascending: false })

  return grades || []
}

function getGradeColor(percentage: number) {
  if (percentage >= 90) return 'bg-green-100 text-green-700'
  if (percentage >= 80) return 'bg-blue-100 text-blue-700'
  if (percentage >= 70) return 'bg-yellow-100 text-yellow-700'
  if (percentage >= 60) return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
}

const columns: Column<GradeWithDetails>[] = [
  {
    key: 'assessment',
    header: 'Assessment',
    cell: (row) => (
      <div>
        <p className="font-medium">{row.assessments?.name}</p>
        <p className="text-xs text-muted-foreground">
          {row.assessments?.class_subjects?.classes?.name} - {row.assessments?.class_subjects?.subjects?.name}
        </p>
      </div>
    ),
  },
  {
    key: 'type',
    header: 'Type',
    cell: (row) => (
      <Badge variant="outline">
        {row.assessments?.type ? row.assessments.type.charAt(0).toUpperCase() + row.assessments.type.slice(1) : '-'}
      </Badge>
    ),
  },
  {
    key: 'score',
    header: 'Score',
    cell: (row) => {
      if (row.score === null) return <span className="text-muted-foreground">Pending</span>
      const percentage = row.assessments?.max_score 
        ? Math.round((row.score / row.assessments.max_score) * 100)
        : 0
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.score}/{row.assessments?.max_score}</span>
          <Badge className={getGradeColor(percentage)} variant="secondary">
            {percentage}%
          </Badge>
        </div>
      )
    },
  },
  {
    key: 'remarks',
    header: 'Remarks',
    cell: (row) => (
      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
        {row.remarks || '-'}
      </p>
    ),
  },
  {
    key: 'graded_at',
    header: 'Date',
    cell: (row) => new Date(row.graded_at).toLocaleDateString(),
  },
]

export default async function StudentGradesPage() {
  const grades = await getStudentGrades()

  if (!grades) {
    redirect('/auth/login')
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/student' },
          { label: 'Grades' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title="My Grades"
          description="View your assessment scores and feedback."
        />
        <DataTable
          columns={columns}
          data={grades}
          emptyMessage="No grades found"
          emptyDescription="Your grades will appear here once your teachers grade your assessments."
        />
      </div>
    </>
  )
}
