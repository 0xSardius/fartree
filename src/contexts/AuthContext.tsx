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

  const fetchUser = async (forceFetch = false) => {
    try {
      // Check session storage for cached user (persists across navigation)
      if (!forceFetch && typeof window !== 'undefined') {
        const cachedUser = sessionStorage.getItem('fartree_user')
        if (cachedUser) {
          try {
            const parsedUser = JSON.parse(cachedUser)
            setUser(parsedUser)
            setLoading(false)
            console.log('✅ Loaded user from session cache')
            return
          } catch {
            // Invalid cache, continue with fetch
            sessionStorage.removeItem('fartree_user')
          }
        }
      }

      setLoading(true)
      setError(null)

      // Check if we're in a Mini App environment
      const isInMiniApp = await sdk.isInMiniApp()
      
      if (isInMiniApp) {
        // Use Quick Auth to fetch user data
        const response = await sdk.quickAuth.fetch('/api/auth/me')
        
        if (!response.ok) {
          console.error(`Auth fetch failed with status: ${response.status}`)
          // Don't throw error, just set user to null
          setUser(null)
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('fartree_user')
          }
          return
        }

        const data = await response.json()
        
        if (data.success && data.user) {
          setUser(data.user)
          // Cache user in session storage for navigation persistence
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('fartree_user', JSON.stringify(data.user))
          }
        } else {
          console.error('Auth response missing user:', data.error)
          setUser(null)
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('fartree_user')
          }
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
            // Cache user in session storage
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('fartree_user', JSON.stringify(data.user))
            }
          } else {
            // Not authenticated, but not an error - user needs to sign in
            setUser(null)
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('fartree_user')
            }
          }
        } else {
          // Not authenticated, but not an error for web users
          setUser(null)
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('fartree_user')
          }
        }
      }

      // Note: sdk.actions.ready() is called once on the main app page entry point

    } catch (err) {
      console.error('Auth error:', err)
      // Don't set error state for navigation - just log it
      // This prevents showing error screens on simple navigation
      setUser(null)
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('fartree_user')
      }
      
      // Note: sdk.actions.ready() is called once on the main app page entry point
    } finally {
      setLoading(false)
    }
  }

  // Initialize auth on mount - only once
  useEffect(() => {
    fetchUser()
  }, [])

  const refetch = async () => {
    await fetchUser(true) // Force refetch
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
