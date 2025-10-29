"use client";

import { useQuickAuth } from "~/hooks/useQuickAuth";

/**
 * HomeTab component displays the user's Fartree profile and links.
 * 
 * This is the main tab where users can view and manage their link-in-bio
 * profile. It shows their Farcaster information, profile links, and
 * provides quick access to profile management features.
 * 
 * @example
 * ```tsx
 * <HomeTab />
 * ```
 */
export function HomeTab() {
  const { user, loading, isAuthenticated } = useQuickAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] px-6">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-fartree-primary-purple border-t-transparent rounded-full"></div>
          <p className="text-fartree-text-secondary">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] px-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🌳</div>
          <h2 className="text-xl font-semibold text-fartree-text-primary mb-2">Welcome to Fartree</h2>
          <p className="text-fartree-text-secondary">Your magical link-in-bio tree</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Profile Header */}
      <div className="text-center">
        <div className="relative inline-block mb-4">
          {user.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={user.avatar_url} 
              alt={user.display_name}
              className="w-20 h-20 rounded-full border-4 border-fartree-primary-purple"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-fartree-primary-purple flex items-center justify-center text-white text-2xl font-bold">
              {user.display_name?.[0] || user.username?.[0] || '?'}
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-fartree-text-primary mb-1">
          {user.display_name || user.username}
        </h1>
        
        <p className="text-fartree-accent-purple font-medium mb-2">
          @{user.username} • FID {user.fid}
        </p>
        
        {user.bio && (
          <p className="text-fartree-text-secondary text-sm max-w-md mx-auto">
            {user.bio}
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-fartree-primary-purple">
            {user.links?.length || 0}
          </div>
          <div className="text-sm text-fartree-text-secondary">Links</div>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-fartree-primary-purple">
            {user.links?.reduce((total, link) => total + link.click_count, 0) || 0}
          </div>
          <div className="text-sm text-fartree-text-secondary">Total Clicks</div>
        </div>
      </div>

      {/* Profile Links */}
      {user.links && user.links.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-fartree-text-primary">Your Links</h3>
          {user.links.map((link) => (
            <div 
              key={link.id}
              className="bg-white/90 dark:bg-gray-800/90 rounded-lg p-4 border border-fartree-border-dark/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-fartree-text-primary truncate">
                    {link.title}
                  </h4>
                  <p className="text-sm text-fartree-text-secondary truncate">
                    {link.url}
                  </p>
                  {link.auto_detected && (
                    <span className="inline-block mt-1 px-2 py-1 bg-fartree-accent-purple/20 text-fartree-accent-purple text-xs rounded">
                      ✨ Auto-detected
                    </span>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-medium text-fartree-primary-purple">
                    {link.click_count}
                  </div>
                  <div className="text-xs text-fartree-text-secondary">clicks</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-lg font-semibold text-fartree-text-primary mb-2">No links yet</h3>
          <p className="text-fartree-text-secondary mb-4">
            Add your first link to start building your tree
          </p>
          <button className="bg-fartree-primary-purple text-white px-6 py-2 rounded-lg hover:bg-fartree-accent-purple transition-colors">
            Add Link
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        <button className="bg-fartree-primary-purple text-white px-4 py-3 rounded-lg hover:bg-fartree-accent-purple transition-colors">
          ✏️ Edit Profile
        </button>
        <button className="bg-white/90 dark:bg-gray-800/90 text-fartree-text-primary px-4 py-3 rounded-lg border border-fartree-border-dark/20 hover:bg-white dark:hover:bg-gray-700 transition-colors">
          🔍 Auto-Scan
        </button>
      </div>
    </div>
  );
} 