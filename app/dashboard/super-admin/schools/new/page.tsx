import { DashboardHeader, PageHeader } from '@/components/dashboard'
import { SchoolForm } from '../school-form'

export default function NewSchoolPage() {
  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/super-admin' },
          { label: 'Schools', href: '/dashboard/super-admin/schools' },
          { label: 'New School' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title="Add New School"
          description="Create a new school on the platform."
        />
        <SchoolForm />
      </div>
    </>
  )
}
