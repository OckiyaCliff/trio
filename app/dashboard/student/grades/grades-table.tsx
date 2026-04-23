'use client'

import { DataTable, type Column } from '@/components/dashboard'
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
        cell: (row) => {
            const assessment = Array.isArray(row.assessments) ? row.assessments[0] : row.assessments;
            const classSubject = Array.isArray(assessment?.class_subjects) ? assessment.class_subjects[0] : assessment?.class_subjects;
            const classObj = Array.isArray(classSubject?.classes) ? classSubject.classes[0] : classSubject?.classes;
            const subjectObj = Array.isArray(classSubject?.subjects) ? classSubject.subjects[0] : classSubject?.subjects;

            return (
                <div>
                    <p className="font-medium">{assessment?.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {classObj?.name} - {subjectObj?.name}
                    </p>
                </div>
            );
        },
    },
    {
        key: 'type',
        header: 'Type',
        cell: (row) => {
            const assessment = Array.isArray(row.assessments) ? row.assessments[0] : row.assessments;
            return (
                <Badge variant="outline">
                    {assessment?.type ? assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1) : '-'}
                </Badge>
            );
        },
    },
    {
        key: 'score',
        header: 'Score',
        cell: (row) => {
            const assessment = Array.isArray(row.assessments) ? row.assessments[0] : row.assessments;
            if (row.score === null) return <span className="text-muted-foreground">Pending</span>
            const percentage = assessment?.max_score
                ? Math.round((row.score / assessment.max_score) * 100)
                : 0
            return (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{row.score}/{assessment?.max_score}</span>
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

interface GradesTableProps {
    data: any[]
}

export function GradesTable({ data }: GradesTableProps) {
    return (
        <DataTable
            columns={columns}
            data={data}
            emptyMessage="No grades found"
            emptyDescription="Your grades will appear here once your teachers grade your assessments."
        />
    )
}
