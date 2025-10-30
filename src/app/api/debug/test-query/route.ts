import { NextResponse } from 'next/server'
import { query } from '~/lib/db'

/**
 * Direct database query test - bypasses all logic
 */
export async function GET() {
  try {
    console.log('[Test Query] Starting direct database test...')

    // Test 1: Get all profiles
    const allProfiles = await query('SELECT fid, username, display_name FROM profiles LIMIT 5')
    console.log('[Test Query] All profiles sample:', allProfiles.rows)

    // Test 2: Get your specific FID (replace with your actual FID)
    const testFid = 238814 // REPLACE THIS WITH YOUR ACTUAL FID
    const yourProfile = await query('SELECT * FROM profiles WHERE fid = $1', [testFid])
    console.log('[Test Query] Your profile:', yourProfile.rows)

    // Test 3: Test the ANY query with a known FID
    const knownFids = allProfiles.rows.map(p => p.fid)
    console.log('[Test Query] Testing with FIDs:', knownFids)
    
    const anyTestResult = await query(
      'SELECT fid, username FROM profiles WHERE fid = ANY($1::bigint[])',
      [knownFids]
    )
    console.log('[Test Query] ANY query result:', anyTestResult.rows)

    // Test 4: Check data types
    const typeCheck = await query(`
      SELECT 
        column_name, 
        data_type,
        udt_name
      FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'fid'
    `)
    console.log('[Test Query] FID column type:', typeCheck.rows)

    return NextResponse.json({
      success: true,
      tests: {
        all_profiles: allProfiles.rows,
        your_profile: yourProfile.rows,
        any_query: anyTestResult.rows,
        fid_type: typeCheck.rows
      }
    })

  } catch (error) {
    console.error('[Test Query] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

