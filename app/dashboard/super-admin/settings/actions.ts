'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSuperAdminProfile(data: {
    first_name: string
    last_name: string
    phone: string | null
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating super admin profile:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/super-admin/settings')
    return { success: true }
}
