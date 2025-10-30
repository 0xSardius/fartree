import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getNeynarUser } from "~/lib/neynar";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');

  const user = fid ? await getNeynarUser(Number(fid)) : null;

  // Default branded image (no user)
  if (!user) {
    return new ImageResponse(
      (
        <div
          tw="flex h-full w-full flex-col justify-center items-center relative"
          style={{
            background: 'linear-gradient(135deg, #8465CB 0%, #a478e8 100%)',
          }}
        >
          <div tw="flex flex-col items-center justify-center">
            <div tw="text-9xl mb-4">🌳</div>
            <h1 tw="text-8xl font-bold text-white mb-4">Fartree</h1>
            <p tw="text-4xl text-white opacity-90">The Linktree for Farcaster</p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 800,
      }
    );
  }

  // User-specific image
  return new ImageResponse(
    (
      <div
        tw="flex h-full w-full flex-col justify-center items-center relative"
        style={{
          background: 'linear-gradient(135deg, #8465CB 0%, #a478e8 100%)',
        }}
      >
        {user.pfp_url && (
          <div tw="flex w-80 h-80 rounded-full overflow-hidden mb-6 border-8 border-white shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.pfp_url} alt="Profile" tw="w-full h-full object-cover" />
          </div>
        )}
        <h1 tw="text-7xl font-bold text-white mb-2">
          {user.display_name || user.username || `User ${user.fid}`}&apos;s Fartree
        </h1>
        <p tw="text-4xl text-white opacity-90">Check out my links 🌳</p>
      </div>
    ),
    {
      width: 1200,
      height: 800,
    }
  );
}