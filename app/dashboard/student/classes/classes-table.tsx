'use client'

import { DataTable, type Column } from '@/components/dashboard'
import { Badge } from '@/components/ui/badge'

const columns: Column<any>[] = [
    {
        key: 'name',
        header: 'Class Name',
        cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
        key: 'grade',
        header: 'Grade',
        cell: (row) => {
            const grade = Array.isArray(row.grades) ? row.grades[0] : row.grades;
            return grade?.name || '-';
        },
    },
    {
        key: 'academic_year',
        header: 'Academic Year',
        cell: (row) => {
            const ay = Array.isArray(row.academic_years) ? row.academic_years[0] : row.academic_years;
            return (
                <div className="flex items-center gap-2">
                    <span>{ay?.name || '-'}</span>
                    {ay?.is_current && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                    )}
                </div>
            );
        },
    },
    {
        key: 'subjects',
        header: 'Subjects',
        cell: (row) => (
            <span className="text-sm text-muted-foreground">
                {row.subjectCount || 0} subject{row.subjectCount !== 1 ? 's' : ''}
            </span>
        ),
    },
    {
        key: 'teacher',
        header: 'Class Teacher',
        cell: (row) => {
            const teacher = row.classTeacher;
            return teacher ? `${teacher.first_name} ${teacher.last_name}` : '-';
        },
    },
]

interface ClassesTableProps {
    data: any[]
}

export function StudentClassesTable({ data }: ClassesTableProps) {
    return (
        <DataTable
            columns={columns}
            data={data}
            emptyMessage="No classes found"
            emptyDescription="You have not been enrolled in any classes yet."
        />
    )
}
