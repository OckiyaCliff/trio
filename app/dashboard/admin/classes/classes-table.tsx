'use client'

import { DataTable, type Column } from '@/components/dashboard'
import { Badge } from '@/components/ui/badge'

interface ClassWithDetails {
    id: string
    name: string
    capacity: number | null
    created_at: string
    grades: { name: string } | null
    academic_years: { name: string; is_current: boolean } | null
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
        cell: (row) => (row.grades as any)?.name || '-',
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
            )
        },
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

interface ClassesTableProps {
    data: any[]
}

export function ClassesTable({ data }: ClassesTableProps) {
    return (
        <DataTable
            columns={columns}
            data={data}
            emptyMessage="No classes found"
            emptyDescription="Create grades and academic years first, then add classes."
        />
    )
}
