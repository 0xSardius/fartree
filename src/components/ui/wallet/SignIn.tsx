'use client';

import { useQuickAuth } from "~/hooks/useQuickAuth";
import { Button } from "../Button";

/**
 * SignIn component displays authentication status using Quick Auth.
 * 
 * Note: This component is for debugging/testing purposes only.
 * Actual authentication is handled by Quick Auth via AuthContext.
 *
 * @example
 * ```tsx
 * <SignIn />
 * ```
 */
export function SignIn() {
  const { user, isAuthenticated, loading } = useQuickAuth();

  if (loading) {
    return (
      <div className="my-2 p-2 text-xs bg-gray-100 dark:bg-gray-900 rounded-lg">
        Loading authentication...
      </div>
    );
  }

  return (
    <>
      {/* Authentication Status */}
      <div className="my-2 p-2 text-xs bg-gray-100 dark:bg-gray-900 rounded-lg">
        <div className="font-semibold text-gray-500 dark:text-gray-300 mb-1">
          Authentication Status
        </div>
        <div className="text-gray-700 dark:text-gray-200">
          {isAuthenticated ? `✅ Authenticated as @${user?.username || 'user'}` : '❌ Not authenticated'}
        </div>
      </div>

      {/* User Information */}
      {user && (
        <div className="my-2 p-2 text-xs overflow-x-scroll bg-gray-100 dark:bg-gray-900 rounded-lg font-mono">
          <div className="font-semibold text-gray-500 dark:text-gray-300 mb-1">User Data</div>
          <div className="whitespace-pre text-gray-700 dark:text-gray-200">
            {JSON.stringify({ fid: user.fid, username: user.username, displayName: user.display_name }, null, 2)}
          </div>
        </div>
      )}
    </>
  );
}
