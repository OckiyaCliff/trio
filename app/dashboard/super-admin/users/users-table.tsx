'use client'

import { DataTable, type Column } from '@/components/dashboard'
import { Badge } from '@/components/ui/badge'

interface UserRow {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    role: string
    school_name: string | null
    created_at: string
}

const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    school_admin: 'School Admin',
    teacher: 'Teacher',
    student: 'Student',
    parent: 'Parent',
}

const columns: Column<UserRow>[] = [
    {
        key: 'first_name',
        header: 'Name',
        cell: (row: UserRow) => (
            <div>
                <p className="font-medium">{`${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Unnamed'}</p>
                <p className="text-xs text-muted-foreground">{row.email}</p>
            </div>
        ),
    },
    {
        key: 'role',
        header: 'Role',
        cell: (row: UserRow) => (
            <Badge variant="secondary" className="font-normal">
                {roleLabels[row.role] || row.role}
            </Badge>
        ),
    },
    {
        key: 'school_name',
        header: 'School',
        cell: (row: UserRow) => <span className="text-sm">{row.school_name || '—'}</span>,
    },
    {
        key: 'created_at',
        header: 'Joined',
        cell: (row: UserRow) => (
            <span className="text-sm text-muted-foreground">
                {new Date(row.created_at).toLocaleDateString()}
            </span>
        ),
    },
]

export function UsersTable({ data }: { data: UserRow[] }) {
    return <DataTable columns={columns} data={data} />
}
