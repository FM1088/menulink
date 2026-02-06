'use client'

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: SupabaseClient<any, 'public', any> | null = null

export function getSupabaseBrowser() {
  if (typeof window === 'undefined') {
    // Server-side: return a dummy client that throws on use
    // This should never actually be used since pages using this are client components
    return createClient('http://localhost', 'dummy')
  }
  
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error('Missing Supabase environment variables')
    }
    client = createClient(url, key)
  }
  return client
}
