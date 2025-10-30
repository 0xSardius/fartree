import { NextRequest, NextResponse } from 'next/server'

/**
 * Simple endpoint to test if API routes work
 * Usage: /api/debug/test-navigation
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const fid = searchParams.get('fid')

  console.log('[Debug] Test navigation endpoint called', { fid })

  return NextResponse.json({
    success: true,
    message: 'API routes are working!',
    timestamp: new Date().toISOString(),
    tested_fid: fid,
    profile_url: fid ? `/profile/${fid}` : null,
    instructions: 'Try visiting /profile/[fid] directly in your browser'
  })
}

