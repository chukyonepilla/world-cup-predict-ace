'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const displayName = formData.get('displayName') as string

  const supabase = await createClient()
  const serviceSupabase = await createServiceClient()

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })

    if (authError) throw authError

    if (authData.user) {
      // Create user profile using service role (bypasses RLS)
      const { error: profileError } = await serviceSupabase.from('users').insert({
        id: authData.user.id,
        email: authData.user.email!,
        display_name: displayName,
      })

      if (profileError) throw profileError

      // Auto-add user to global league using service role (bypasses RLS)
      await serviceSupabase.from('league_members').insert({
        league_id: '00000000-0000-0000-0000-000000000001',
        user_id: authData.user.id,
        role: 'member',
      })

      revalidatePath('/dashboard')
      return { success: true }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }

  return { success: false, error: 'Registration failed' }
}
