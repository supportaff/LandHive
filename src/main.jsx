import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  console.warn('Missing VITE_CLERK_PUBLISHABLE_KEY — auth features disabled')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY || 'pk_test_placeholder'}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/role-select"
      appearance={{
        variables: {
          colorPrimary: '#16a34a',
          colorText: '#1e293b',
          borderRadius: '0.75rem',
          fontFamily: 'DM Sans, sans-serif',
        },
        elements: {
          formButtonPrimary: 'bg-primary-600 hover:bg-primary-700',
          card: 'shadow-xl border border-slate-100',
        },
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)
