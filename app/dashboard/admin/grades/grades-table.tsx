'use client'

import { DataTable, type Column } from '@/components/dashboard'
import type { Grade } from '@/lib/types'

const columns: Column<Grade>[] = [
    {
        key: 'name',
        header: 'Grade Name',
        cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
        key: 'level',
        header: 'Level',
        cell: (row) => row.level || '-',
    },
    {
        key: 'created_at',
        header: 'Created',
        cell: (row) => new Date(row.created_at).toLocaleDateString(),
    },
]

interface GradesTableProps {
    data: Grade[]
}

export function GradesTable({ data }: GradesTableProps) {
    return (
        <DataTable
            columns={columns}
            data={data}
            emptyMessage="No grades found"
            emptyDescription="Get started by adding your first grade level."
        />
    )
}
