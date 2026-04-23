'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: {
    first_name: string
    last_name: string
    phone: string | null
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/teacher/settings')
    return { success: true }
}
