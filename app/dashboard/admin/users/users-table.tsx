'use client'

import { DataTable, type Column } from '@/components/dashboard'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ROLE_LABELS, type Profile } from '@/lib/types'

const columns: Column<Profile>[] = [
    {
        key: 'name',
        header: 'User',
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
        key: 'role',
        header: 'Role',
        cell: (row) => (
            <Badge variant="outline">{ROLE_LABELS[row.role]}</Badge>
        ),
    },
    {
        key: 'phone',
        header: 'Phone',
        cell: (row) => row.phone || '-',
    },
    {
        key: 'created_at',
        header: 'Joined',
        cell: (row) => new Date(row.created_at).toLocaleDateString(),
    },
]

interface UsersTableProps {
    data: Profile[]
}

export function UsersTable({ data }: UsersTableProps) {
    return (
        <DataTable
            columns={columns}
            data={data}
            emptyMessage="No users found"
            emptyDescription="Users will appear here once they register with your school code."
        />
    )
}
