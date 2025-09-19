import React from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../config/supabase'

export default function LoginPage() {
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <span className="login-icon">🔬</span>
          <h1>Automatic Researcher Dashboard</h1>
          <p>Please sign in to continue</p>
        </div>
        <div className="login-form">
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#3b82f6',
                    brandAccent: '#2563eb',
                  }
                }
              }
            }}
            providers={['google', 'email']}
          />
        </div>
      </div>
    </div>
  )
}
