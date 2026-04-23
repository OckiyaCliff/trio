'use client'

import { DataTable, type Column } from '@/components/dashboard'
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

interface AssessmentsTableProps {
    data: any[]
}

export function AssessmentsTable({ data }: AssessmentsTableProps) {
    return (
        <DataTable
            columns={columns}
            data={data}
            emptyMessage="No assessments found"
            emptyDescription="You haven't created any assessments yet. You need to be assigned to classes first."
        />
    )
}
