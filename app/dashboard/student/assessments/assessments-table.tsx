'use client'

import { DataTable, type Column } from '@/components/dashboard'
import { Badge } from '@/components/ui/badge'

function getStatusBadge(dueDate: string | null, hasScore: boolean) {
    if (hasScore) return <Badge variant="default">Graded</Badge>
    if (!dueDate) return <Badge variant="secondary">No due date</Badge>
    const now = new Date()
    const due = new Date(dueDate)
    if (due < now) return <Badge variant="destructive">Overdue</Badge>
    return <Badge variant="outline">Upcoming</Badge>
}

function formatType(type: string) {
    return type
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
}

const columns: Column<any>[] = [
    {
        key: 'name',
        header: 'Assessment',
        cell: (row) => {
            const assessment = row;
            const classSubject = Array.isArray(assessment.class_subjects) ? assessment.class_subjects[0] : assessment.class_subjects;
            const subject = Array.isArray(classSubject?.subjects) ? classSubject.subjects[0] : classSubject?.subjects;
            const cls = Array.isArray(classSubject?.classes) ? classSubject.classes[0] : classSubject?.classes;

            return (
                <div>
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {cls?.name} — {subject?.name}
                    </p>
                </div>
            );
        },
    },
    {
        key: 'type',
        header: 'Type',
        cell: (row) => (
            <Badge variant="outline">{formatType(row.type || '')}</Badge>
        ),
    },
    {
        key: 'max_score',
        header: 'Max Score',
        cell: (row) => row.max_score || '-',
    },
    {
        key: 'due_date',
        header: 'Due Date',
        cell: (row) => row.due_date ? new Date(row.due_date).toLocaleDateString() : '-',
    },
    {
        key: 'score',
        header: 'My Score',
        cell: (row) => {
            const score = row.studentScore;
            if (score === null || score === undefined) {
                return <span className="text-muted-foreground">—</span>;
            }
            const percentage = row.max_score ? Math.round((score / row.max_score) * 100) : 0;
            return (
                <span className="font-medium">{score}/{row.max_score} ({percentage}%)</span>
            );
        },
    },
    {
        key: 'status',
        header: 'Status',
        cell: (row) => getStatusBadge(row.due_date, row.studentScore !== null && row.studentScore !== undefined),
    },
]

interface AssessmentsTableProps {
    data: any[]
}

export function StudentAssessmentsTable({ data }: AssessmentsTableProps) {
    return (
        <DataTable
            columns={columns}
            data={data}
            emptyMessage="No assessments found"
            emptyDescription="Your assessments will appear here once your teachers create them."
        />
    )
}
