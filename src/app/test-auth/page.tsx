"use client"

import { useEffect, useState } from "react"
import { useAuth } from "~/contexts/AuthContext"

export default function TestAuthPage() {
  const { user, loading, error, isAuthenticated } = useAuth()
  const [profileData, setProfileData] = useState<any>(null)
  const [linksData, setLinksData] = useState<any>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    async function testAPIs() {
      if (!user?.fid) return

      try {
        console.log('🔍 Testing APIs with FID:', user.fid)
        
        // Test profile API
        const profileRes = await fetch(`/api/profiles/${user.fid}`)
        const profileJson = await profileRes.json()
        console.log('Profile API response:', profileJson)
        setProfileData(profileJson)

        // Test links API
        const linksRes = await fetch(`/api/profiles/${user.fid}/links?include_hidden=true`)
        const linksJson = await linksRes.json()
        console.log('Links API response:', linksJson)
        setLinksData(linksJson)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('API test error:', err)
        setApiError(message)
      }
    }

    if (isAuthenticated && user) {
      testAPIs()
    }
  }, [user, isAuthenticated])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-mono">
      <h1 className="text-3xl font-bold mb-8">🔍 Auth & API Test Page</h1>

      <div className="space-y-8">
        {/* Auth Status */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">🔐 Auth Status</h2>
          
          {loading && (
            <div className="text-yellow-400">⏳ Loading authentication...</div>
          )}
          
          {error && (
            <div className="text-red-400">❌ Error: {error}</div>
          )}
          
          {!loading && !error && (
            <div>
              <div className="mb-2">
                <strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
              </div>
              
              {user && (
                <div className="space-y-2 mt-4">
                  <div><strong>FID:</strong> {user.fid}</div>
                  <div><strong>Username:</strong> @{user.username}</div>
                  <div><strong>Display Name:</strong> {user.display_name}</div>
                  <div><strong>Bio:</strong> {user.bio || 'N/A'}</div>
                  <div><strong>Avatar:</strong> {user.avatar_url ? '✅' : '❌'}</div>
                  <div><strong>Theme:</strong> {user.theme}</div>
                  <div><strong>Links (from auth):</strong> {user.links?.length || 0}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile API Test */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">📋 Profile API Test</h2>
          
          {!user && <div className="text-gray-400">Waiting for user authentication...</div>}
          
          {user && !profileData && !apiError && (
            <div className="text-yellow-400">⏳ Testing profile API...</div>
          )}
          
          {apiError && (
            <div className="text-red-400">❌ Error: {apiError}</div>
          )}
          
          {profileData && (
            <div>
              <div className="mb-2">
                <strong>Success:</strong> {profileData.success ? '✅ Yes' : '❌ No'}
              </div>
              
              {profileData.success && profileData.profile && (
                <div className="space-y-2 mt-4">
                  <div><strong>ID:</strong> {profileData.profile.id}</div>
                  <div><strong>FID:</strong> {profileData.profile.fid}</div>
                  <div><strong>Username:</strong> @{profileData.profile.username}</div>
                  <div><strong>Display Name:</strong> {profileData.profile.display_name}</div>
                  <div><strong>Links in response:</strong> {profileData.profile.links?.length || 0}</div>
                </div>
              )}
              
              {!profileData.success && (
                <div className="text-red-400 mt-2">
                  Error: {profileData.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Links API Test */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">🔗 Links API Test</h2>
          
          {!user && <div className="text-gray-400">Waiting for user authentication...</div>}
          
          {user && !linksData && !apiError && (
            <div className="text-yellow-400">⏳ Testing links API...</div>
          )}
          
          {linksData && (
            <div>
              <div className="mb-2">
                <strong>Success:</strong> {linksData.success ? '✅ Yes' : '❌ No'}
              </div>
              <div className="mb-2">
                <strong>Count:</strong> {linksData.count}
              </div>
              
              {linksData.success && linksData.links && (
                <div className="space-y-3 mt-4">
                  {linksData.links.map((link: any, idx: number) => (
                    <div key={link.id} className="bg-gray-700 p-3 rounded">
                      <div><strong>Link {idx + 1}:</strong> {link.title}</div>
                      <div className="text-sm text-gray-300 mt-1">
                        URL: {link.url}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        Category: {link.category || 'N/A'} | 
                        Clicks: {link.click_count} | 
                        Auto: {link.auto_detected ? '✅' : '❌'} |
                        Visible: {link.is_visible ? '✅' : '❌'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {linksData.links && linksData.links.length === 0 && (
                <div className="text-yellow-400 mt-2">
                  ⚠️ No links found for this profile
                </div>
              )}
            </div>
          )}
        </div>

        {/* Raw User Object */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">🔍 Raw User Object</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
