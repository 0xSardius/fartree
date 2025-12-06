import { NextResponse } from 'next/server';

/**
 * Legacy route - no longer used.
 * Authentication is now handled by Quick Auth via /api/auth/me
 */
export async function POST(request: Request) {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use Quick Auth instead.' },
    { status: 410 }
  );
}
