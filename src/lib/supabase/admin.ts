import { createClient } from '@supabase/supabase-js'

// TODO: Add Database generic when Supabase is connected
// import type { Database } from './database.types'

// Admin client with service_role — only use in server-side code
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
