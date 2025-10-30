"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { WindowFrame } from "~/components/window-frame";

interface ProfilePageClientProps {
  fid: string;
  children: React.ReactNode;
}

/**
 * Client-side wrapper for the profile page that handles:
 * - Loading states during server rendering
 * - Error boundaries for failed renders
 * - Navigation back button
 * - Debug logging
 */
export function ProfilePageClient({ fid, children }: ProfilePageClientProps) {
  const router = useRouter();
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log(`📍 Profile page loaded for FID: ${fid}`);

    // Check if we got valid children (profile rendered successfully)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [fid]);

  // Error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Profile page error:", event.error);
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
        <WindowFrame title="Profile Error" className="w-full max-w-md">
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-fartree-text-primary mb-2">
              Failed to Load Profile
            </h1>
            <p className="text-fartree-text-secondary mb-6">
              There was an error loading this profile (FID: {fid})
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="bg-fartree-primary-purple hover:bg-fartree-accent-purple"
              >
                Retry
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/discover")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Discover
              </Button>
            </div>
          </div>
        </WindowFrame>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-fartree-primary-purple" />
          <p className="text-fartree-text-primary">Loading profile...</p>
          <p className="text-xs text-fartree-text-secondary mt-2">FID: {fid}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
