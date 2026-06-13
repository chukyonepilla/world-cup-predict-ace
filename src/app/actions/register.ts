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
    // Create auth user with email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
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

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw profileError
      }

      // Ensure global league exists using service role
      const GLOBAL_LEAGUE_ID = '00000000-0000-0000-0000-000000000001'
      const { error: leagueError } = await serviceSupabase
        .from('leagues')
        .upsert({
          id: GLOBAL_LEAGUE_ID,
          name: 'Global League',
          code: 'GLOBAL',
          description: 'The official World Cup prediction league',
          max_members: 10000,
          created_by: authData.user.id,
        }, { onConflict: 'id' })
      
      if (leagueError) {
        console.error('League creation error:', leagueError)
        throw leagueError
      }

      // Auto-add user to global league using service role (bypasses RLS)
      try {
        const { error: memberError } = await serviceSupabase.from('league_members').insert({
          league_id: GLOBAL_LEAGUE_ID,
          user_id: authData.user.id,
          role: 'member',
        })
        
        if (memberError) {
          console.error('League member addition error:', memberError)
          if (memberError.code !== '23505') {
            throw memberError
          }
        }
      } catch (err: any) {
        // Ignore duplicate key errors (user already in league)
        if (err.code !== '23505') {
          console.error('League member insertion error:', err)
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
