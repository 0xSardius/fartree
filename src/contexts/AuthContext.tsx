"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

interface User {
  id: string
  fid: number
  username: string
  display_name: string
  bio?: string
  avatar_url?: string
  theme: string
  links: Array<{
    id: string
    title: string
    url: string
    category?: string
    position: number
    click_count: number
    auto_detected: boolean
  }>
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if we're in a Mini App environment
      const isInMiniApp = await sdk.isInMiniApp()
      
      if (isInMiniApp) {
        // Use Quick Auth to fetch user data
        const response = await sdk.quickAuth.fetch('/api/auth/me')
        
        if (!response.ok) {
          throw new Error(`Authentication failed: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          throw new Error(data.error || 'Authentication failed')
        }
      } else {
        // Fallback for non-miniapp environments (web)
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setUser(data.user)
          } else {
            // Not authenticated, but not an error - user needs to sign in
            setUser(null)
          }
        } else {
          // Not authenticated, but not an error for web users
          setUser(null)
        }
      }

      // Note: sdk.actions.ready() is called once on the main app page entry point

    } catch (err) {
      console.error('Auth error:', err)
      setError(err instanceof Error ? err.message : 'Authentication failed')
      
      // Note: sdk.actions.ready() is called once on the main app page entry point
    } finally {
      setLoading(false)
    }
  }

  // Initialize auth on mount
  useEffect(() => {
    fetchUser()
  }, [])

  const refetch = async () => {
    await fetchUser()
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    refetch
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
