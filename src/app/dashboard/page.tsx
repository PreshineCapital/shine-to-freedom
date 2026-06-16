import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text)',
      fontFamily: 'Inter, sans-serif',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <h1 style={{fontFamily: 'Geist, Inter', fontWeight: 800, fontSize: '2rem'}}>
        Welcome back
      </h1>
      <p style={{color: 'var(--muted)'}}>Signed in as: {user.email}</p>
      <form action="/auth/signout" method="post">
        <button type="submit" style={{
          padding: '.75rem 2rem',
          borderRadius: '100px',
          background: 'rgba(255,255,255,.06)',
          border: '1px solid rgba(255,255,255,.1)',
          color: 'var(--text)',
          cursor: 'pointer',
          fontSize: '.9rem',
        }}>
          Sign Out
        </button>
      </form>
    </div>
  )
}