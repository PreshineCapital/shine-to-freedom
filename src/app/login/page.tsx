'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(28px)',
        border: '1px solid var(--glass-b)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
      }}>
        {/* Your SVG logo mark */}
        <svg width="48" height="48" viewBox="0 0 80 80" fill="none" style={{margin: '0 auto 1.5rem'}}>
          <path d="M40 72 L8 28 L40 44 L72 28 Z" fill="url(#lg1)"/>
          <path d="M40 44 L72 28 L40 72 Z" fill="rgba(201,168,76,0.45)"/>
          <polygon points="40,8 44,18 40,16 36,18" fill="#00C46A"/>
          <defs>
            <linearGradient id="lg1" x1="8" y1="28" x2="72" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C9A84C"/>
              <stop offset="100%" stopColor="#F0D684"/>
            </linearGradient>
          </defs>
        </svg>

        <h1 style={{
          fontFamily: 'Geist, Inter, sans-serif',
          fontSize: '1.6rem',
          fontWeight: 800,
          marginBottom: '.5rem',
          background: 'linear-gradient(120deg, #C9A84C 0%, #F0D684 55%, #C9A84C 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          SHINE TO FREEDOM
        </h1>

        <p style={{color: 'var(--muted)', fontSize: '.9rem', marginBottom: '2rem', lineHeight: 1.7}}>
          Sign in to access your dashboard and earning platforms.
        </p>

        <button
          onClick={signInWithGoogle}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '100px',
            background: 'linear-gradient(135deg, #8A6E22, #C9A84C, #F0D684)',
            color: '#070B14',
            fontWeight: 800,
            fontSize: '1rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '.75rem',
            boxShadow: '0 8px 30px rgba(201,168,76,.25)',
          }}
        >
          {/* Google G icon */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  )
}