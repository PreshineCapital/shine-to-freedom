'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // This forces Google to always ask the user to pick an account or type their email
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
        // This sends them to your callback route which securely routes them to the dashboard
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#070814', color: '#FFFFFF', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#0C1322', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)', maxWidth: '400px', width: '100%' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#C9A84C' }}>Sign In to Shine To Freedom</h1>
        <p style={{ color: '#8C9BAE', marginBottom: '30px', fontSize: '14px' }}>Log in to access your dashboard and secure downloads.</p>
        
        {error && <p style={{ color: '#FF5B5B', marginBottom: '15px', fontSize: '13px' }}>{error}</p>}
        
        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#FFFFFF', color: '#070814', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <img src="https://google.com" alt="Google" style={{ width: '18px', height: '18px' }} />
          {loading ? 'Connecting to Google...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
}