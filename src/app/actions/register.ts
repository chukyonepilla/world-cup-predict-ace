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
    // Create auth user using service role to bypass email confirmation for testing
    const { data: authData, error: authError } = await serviceSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        display_name: displayName,
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

      // Ensure global league exists using service role
      const GLOBAL_LEAGUE_ID = '00000000-0000-0000-0000-000000000001'
      await serviceSupabase
        .from('leagues')
        .upsert({
          id: GLOBAL_LEAGUE_ID,
          name: 'Global League',
          code: 'GLOBAL',
          description: 'The official World Cup prediction league',
          max_members: 10000,
          created_by: authData.user.id,
        }, { onConflict: 'id' })

      // Auto-add user to global league using service role (bypasses RLS)
      try {
        await serviceSupabase.from('league_members').insert({
          league_id: GLOBAL_LEAGUE_ID,
          user_id: authData.user.id,
          role: 'member',
        })
      } catch (err: any) {
        // Ignore duplicate key errors (user already in league)
        if (err.code !== '23505') {
          throw err
        }
      }

      revalidatePath('/dashboard')
      return { success: true }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }

  return { success: false, error: 'Registration failed' }
}
