'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { GraduationCap } from 'lucide-react'
import { type UserRole, ROLE_LABELS } from '@/lib/types'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<UserRole | ''>('')
  const [schoolCode, setSchoolCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!role) {
      setError('Please select a role')
      return
    }

    // Prevent super_admin registration from the public page
    if (role === 'super_admin') {
      setError('Invalid role selection')
      return
    }

    // School code required for all public registration roles
    if (!schoolCode) {
      setError('School code is required')
      return
    }

    setLoading(true)

    try {
      // Verify school code
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('id')
        .eq('code', schoolCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (schoolError || !school) {
        setError('Invalid school code')
        setLoading(false)
        return
      }
      const schoolId = school.id

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName,
            last_name: lastName,
            role,
            school_id: schoolId,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      router.push('/auth/sign-up-success')
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const showSchoolCode = role && role !== 'super_admin'

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Join TRIO to manage your educational journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="role">Role</FieldLabel>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(ROLE_LABELS) as [UserRole, string][])
                      .filter(([value]) => value !== 'super_admin')
                      .map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </Field>

              {showSchoolCode && (
                <Field>
                  <FieldLabel htmlFor="schoolCode">School Code</FieldLabel>
                  <Input
                    id="schoolCode"
                    placeholder="Enter your school code"
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ask your school administrator for the code
                  </p>
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </Field>
            </FieldGroup>

            {error && (
              <p className="mt-4 text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="mt-6 w-full" disabled={loading}>
              {loading ? <Spinner className="mr-2" /> : null}
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
