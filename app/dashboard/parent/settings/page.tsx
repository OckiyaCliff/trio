import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader } from '@/components/dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SettingsForm } from './settings-form'

async function getParentProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select(`
      first_name,
      last_name,
      phone,
      email,
      school_id,
      schools (name)
    `)
        .eq('id', user.id)
        .single()

    return profile
}

export default async function ParentSettingsPage() {
    const profile = await getParentProfile()

    if (!profile) {
        redirect('/auth/login')
    }

    return (
        <>
            <DashboardHeader
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard/parent' },
                    { label: 'Settings' },
                ]}
            />
            <div className="flex flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto">
                <PageHeader
                    title="Settings"
                    description="Manage your account profile and school information."
                />

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your personal details and contact information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SettingsForm initialData={profile as any} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>School Association</CardTitle>
                            <CardDescription>
                                Information about your assigned school.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">School Name</p>
                                    <p className="text-lg font-semibold">
                                        {(Array.isArray(profile.schools) ? profile.schools[0] : profile.schools)?.name || 'Not assigned'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">School ID</p>
                                    <p className="text-sm font-mono">{profile.school_id || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
