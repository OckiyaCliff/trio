import { createClient } from '@/lib/supabase/server'
import { DashboardHeader, PageHeader } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { SchoolsTable } from './schools-table'

async function getSchools() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('schools')
    .select('*')
    .order('created_at', { ascending: false })

  return data || []
}

export default async function SchoolsPage() {
  const schools = await getSchools()

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/super-admin' },
          { label: 'Schools' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title="Schools"
          description="Manage all schools on the platform."
          actions={
            <Button asChild>
              <Link href="/dashboard/super-admin/schools/new">
                <Plus className="mr-2 h-4 w-4" />
                Add School
              </Link>
            </Button>
          }
        />
        <SchoolsTable schools={schools} />
      </div>
    </>
  )
}
