import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface User {
  id: string;
  fid: number;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  theme: string;
  links: Array<{
    id: string;
    title: string;
    url: string;
    category?: string;
    position: number;
    click_count: number;
    auto_detected: boolean;
  }>;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useQuickAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    async function authenticate() {
      try {
        setAuthState(prev => ({ ...prev, loading: true, error: null }));

        // Check if we're in a Mini App environment with longer timeout for desktop
        const isInMiniApp = await sdk.isInMiniApp(500); // Increased timeout for desktop iframe
        
        if (isInMiniApp) {
          // Use Quick Auth to get authenticated token and make request
          const response = await sdk.quickAuth.fetch('/api/auth/me');
          
          if (!response.ok) {
            throw new Error(`Authentication failed: ${response.status}`);
          }

          const data = await response.json();
          
          if (!mounted) return;

          if (data.success && data.user) {
            setAuthState({
              user: data.user,
              loading: false,
              error: null
            });
          } else {
            throw new Error(data.error || 'Authentication failed');
          }
        } else {
          // Graceful fallback: Try to make a regular authenticated request
          // This handles cases where user is on desktop web or other environments
          try {
            const response = await fetch('/api/auth/me', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.user) {
                setAuthState({
                  user: data.user,
                  loading: false,
                  error: null
                });
                return;
              }
            }
          } catch (fallbackError) {
            console.log('Fallback auth also failed:', fallbackError);
          }
          
          // If we reach here, user needs to authenticate
          setAuthState({
            user: null,
            loading: false,
            error: null // No error - just not authenticated
          });
        }

      } catch (error) {
        console.error('Quick Auth error:', error);
        
        if (!mounted) return;
        
        setAuthState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication failed'
        });
      }
    }

    authenticate();

    return () => {
      mounted = false;
    };
  }, []);

  const refetch = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await sdk.quickAuth.fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.success && data.user) {
        setAuthState({
          user: data.user,
          loading: false,
          error: null
        });
      } else {
        throw new Error(data.error || 'Failed to refetch user');
      }
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refetch user'
      });
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    refetch
  };
}
