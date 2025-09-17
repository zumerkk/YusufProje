import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../shared/types/database'

const supabaseUrl = process.env.SUPABASE_URL || 'https://cvmkqazxtgrrsqcfctzk.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWtxYXp4dGdycnNxY2ZjdHprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0MDM5OCwiZXhwIjoyMDcyOTE2Mzk4fQ.KlN5ttIoejjuwzfCqPkpkLVVSMd6y_YaOEY4e_QsobU'

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})