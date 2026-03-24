'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import type { School } from '@/lib/types'

interface SchoolFormProps {
  school?: School
}

function generateSchoolCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function SchoolForm({ school }: SchoolFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!school

  const [name, setName] = useState(school?.name || '')
  const [code, setCode] = useState(school?.code || generateSchoolCode())
  const [email, setEmail] = useState(school?.email || '')
  const [phone, setPhone] = useState(school?.phone || '')
  const [address, setAddress] = useState(school?.address || '')
  const [isActive, setIsActive] = useState(school?.is_active ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const schoolData = {
        name,
        code: code.toUpperCase(),
        email: email || null,
        phone: phone || null,
        address: address || null,
        is_active: isActive,
      }

      if (isEditing) {
        const { error } = await supabase
          .from('schools')
          .update(schoolData)
          .eq('id', school.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('schools').insert(schoolData)
        if (error) throw error
      }

      router.push('/dashboard/super-admin/schools')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save school')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit School' : 'School Details'}</CardTitle>
        <CardDescription>
          {isEditing
            ? 'Update the school information below.'
            : 'Enter the details for the new school.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">School Name *</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter school name"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="code">School Code *</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="SCHOOL1"
                  maxLength={10}
                  required
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCode(generateSchoolCode())}
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Users will use this code to join the school during registration.
              </p>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="school@example.com"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 890"
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter school address"
                rows={3}
              />
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel htmlFor="active">Active Status</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Inactive schools cannot accept new registrations.
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </Field>
          </FieldGroup>

          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}

          <div className="mt-6 flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading && <Spinner className="mr-2" />}
              {isEditing ? 'Update School' : 'Create School'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
