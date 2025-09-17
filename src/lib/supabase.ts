import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../shared/types/database'

const supabaseUrl = 'https://cvmkqazxtgrrsqcfctzk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWtxYXp4dGdycnNxY2ZjdHprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDAzOTgsImV4cCI6MjA3MjkxNjM5OH0.s3IDaeFvFgKzo9h-2Zv4MhOVAUKWCqrYa8Y7AKGwSW8'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export const signUp = async (email: string, password: string, userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

export const getSession = () => {
  return supabase.auth.getSession()
}

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}