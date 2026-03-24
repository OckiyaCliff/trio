'use client'

import { DataTable, type Column } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { Subject } from '@/lib/types'

interface SubjectsTableProps {
  subjects: Subject[]
}

export function SubjectsTable({ subjects }: SubjectsTableProps) {
  const columns: Column<Subject>[] = [
    {
      key: 'name',
      header: 'Subject Name',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          {row.code && (
            <code className="text-xs text-muted-foreground">{row.code}</code>
          )}
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      cell: (row) => (
        <p className="text-sm text-muted-foreground truncate max-w-[300px]">
          {row.description || '-'}
        </p>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      cell: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[50px]',
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={subjects}
      emptyMessage="No subjects found"
      emptyDescription="Get started by adding your first subject."
    />
  )
}
