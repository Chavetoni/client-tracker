"use client";
import ClientTracker from '@/components/ClientTracker'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication status
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  // Show loading state
  if (loading) {
    return <div>Loading...</div>
  }

  // Redirect if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Show app if authenticated
  return (
    <main>
      <ClientTracker />
    </main>
  )
}