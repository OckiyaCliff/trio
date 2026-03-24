'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'

interface AddGradeDialogProps {
  schoolId: string
}

export function AddGradeDialog({ schoolId }: AddGradeDialogProps) {
  const router = useRouter()
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [level, setLevel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.from('grades').insert({
        school_id: schoolId,
        name,
        level: parseInt(level, 10),
      })

      if (error) throw error

      setOpen(false)
      setName('')
      setLevel('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add grade')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Grade
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Grade</DialogTitle>
          <DialogDescription>
            Create a new grade level for your school.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Grade Name *</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Grade 1, Year 7"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="level">Level *</FieldLabel>
              <Input
                id="level"
                type="number"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="e.g., 1, 2, 3"
                min={1}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Numeric level for ordering (e.g., 1 for Grade 1)
              </p>
            </Field>
          </FieldGroup>

          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner className="mr-2" />}
              Add Grade
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
