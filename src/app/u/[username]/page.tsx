import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'

// Server-side function to get profile by username
async function getProfileByUsername(username: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/profiles/${username}`, {
      cache: 'no-store',
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch profile: ${response.status}`)
    }
    
    const data = await response.json()
    return data.success ? data.profile : null
  } catch (error) {
    console.error('Error fetching profile by username:', error)
    return null
  }
}

// Username-based profile page - redirects to FID-based URL
export default async function UsernameProfilePage({ params }: { params: { username: string } }) {
  const { username } = params
  
  // Remove @ if present
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username
  
  // Fetch profile by username
  const profile = await getProfileByUsername(cleanUsername)
  
  if (!profile) {
    notFound()
  }
  
  // Redirect to the FID-based URL for consistency
  redirect(`/profile/${profile.fid}`)
}
