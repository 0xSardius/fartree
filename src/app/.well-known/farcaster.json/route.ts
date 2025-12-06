import { NextResponse } from 'next/server';
import { getFarcasterMetadata } from '../../../lib/utils';

export async function GET() {
  try {
    const config = await getFarcasterMetadata();
    return NextResponse.json(config, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
