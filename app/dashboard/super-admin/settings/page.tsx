import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardHeader, PageHeader } from '@/components/dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SettingsForm } from './settings-form'

async function getSuperAdminProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, email, role')
        .eq('id', user.id)
        .single()

    return profile
}

export default async function SuperAdminSettingsPage() {
    const profile = await getSuperAdminProfile()

    if (!profile) {
        redirect('/auth/login')
    }

    return (
        <>
            <DashboardHeader
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard/super-admin' },
                    { label: 'Settings' },
                ]}
            />
            <div className="flex flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto">
                <PageHeader
                    title="Settings"
                    description="Manage your super admin account."
                />

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your personal details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SettingsForm initialData={profile as any} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Role</CardTitle>
                            <CardDescription>
                                Your current access level.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                                    Super Admin
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    Full platform access across all schools and users.
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
