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

        // Check if we're in a Mini App environment
        const isInMiniApp = await sdk.isInMiniApp();
        
        if (!isInMiniApp) {
          // Not in Mini App - handle gracefully
          setAuthState({
            user: null,
            loading: false,
            error: 'Not running in Mini App environment'
          });
          return;
        }

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
