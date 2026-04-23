'use client'

import { DataTable, type Column } from '@/components/dashboard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Profile } from '@/lib/types'

interface StudentWithClass extends Profile {
    className?: string
}

const columns: Column<StudentWithClass>[] = [
    {
        key: 'name',
        header: 'Student',
        cell: (row) => {
            const initials = `${row.first_name?.[0] || ''}${row.last_name?.[0] || ''}`.toUpperCase()
            const name = `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Unknown'
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={row.avatar_url || ''} />
                        <AvatarFallback>{initials || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">{row.email}</p>
                    </div>
                </div>
            )
        },
    },
    {
        key: 'className',
        header: 'Class',
        cell: (row) => <Badge variant="outline">{row.className}</Badge>,
    },
    {
        key: 'phone',
        header: 'Phone',
        cell: (row) => row.phone || '-',
    },
]

interface StudentsTableProps {
    data: StudentWithClass[]
}

export function StudentsTable({ data }: StudentsTableProps) {
    return (
        <DataTable
            columns={columns}
            data={data}
            emptyMessage="No students found"
            emptyDescription="No students are enrolled in your classes yet."
        />
    )
}
