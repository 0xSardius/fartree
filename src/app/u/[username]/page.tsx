import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'

// Server-side function to get profile by username
async function getProfileByUsername(username: string) {
  try {
    // Use direct database query instead of internal API call
    const { query } = await import('~/lib/db')
    
    const result = await query('SELECT * FROM profiles WHERE username = $1', [username])
    return result.rows.length > 0 ? result.rows[0] : null
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
