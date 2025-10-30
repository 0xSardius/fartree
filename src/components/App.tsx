"use client";

import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { Header } from "~/components/ui/Header";
import { Footer } from "~/components/ui/Footer";
import {
  HomeTab,
  ActionsTab,
  ContextTab,
  WalletTab,
} from "~/components/ui/tabs";
import { useQuickAuth } from "~/hooks/useQuickAuth";
import { USE_WALLET } from "~/lib/constants";

// --- Types ---
export enum Tab {
  Home = "home",
  Actions = "actions",
  Context = "context",
  Wallet = "wallet",
}

export interface AppProps {
  title?: string;
}

/**
 * App component serves as the main container for the mini app interface.
 *
 * This component orchestrates the overall mini app experience by:
 * - Managing tab navigation and state
 * - Handling Farcaster mini app initialization
 * - Coordinating wallet and context state
 * - Providing error handling and loading states
 * - Rendering the appropriate tab content based on user selection
 *
 * The component integrates with the Neynar SDK for Farcaster functionality
 * and Wagmi for wallet management. It provides a complete mini app
 * experience with multiple tabs for different functionality areas.
 *
 * Features:
 * - Tab-based navigation (Home, Actions, Context, Wallet)
 * - Farcaster mini app integration
 * - Wallet connection management
 * - Error handling and display
 * - Loading states for async operations
 *
 * @param props - Component props
 * @param props.title - Optional title for the mini app (defaults to "Neynar Starter Kit")
 *
 * @example
 * ```tsx
 * <App title="My Mini App" />
 * ```
 */
export default function App({ title }: AppProps = { title: "Fartree" }) {
  // --- State ---
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.Home);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Record<string, unknown> | null>(null);

  // --- Quick Auth ---
  const { loading: authLoading, error: authError } = useQuickAuth();

  // --- Effects ---
  /**
   * Suppress SDK analytics errors (non-critical)
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const originalError = console.error;
      console.error = (...args) => {
        // Suppress known Farcaster infrastructure errors
        const errorStr = args.join(" ");
        if (
          errorStr.includes("client.farcaster.xyz") ||
          errorStr.includes("client.warpcast.com") ||
          errorStr.includes("usePutMiniAppEvent") ||
          errorStr.includes("analytics-events") ||
          errorStr.includes("user-preferences")
        ) {
          // Silently ignore SDK analytics failures
          return;
        }
        originalError.apply(console, args);
      };

      return () => {
        console.error = originalError;
      };
    }
  }, []);

  /**
   * Initialize the Mini App SDK and set up context
   */
  useEffect(() => {
    async function initializeSDK() {
      try {
        // Check if we're in a Mini App environment with longer timeout
        const isInMiniApp = await sdk.isInMiniApp();

        if (isInMiniApp) {
          console.log("✅ Mini App environment detected");
          // Get Mini App context (await because sdk.context is a Promise)
          const miniAppContext = await sdk.context;
          setContext(miniAppContext as unknown as Record<string, unknown>);

          // Note: sdk.actions.ready() is called once on the main app page entry point
          // This component just gets the context for display purposes
        } else {
          console.log("⚠️ Not in Mini App environment - running as web app");
          // Still set SDK as loaded for web app functionality
        }

        setIsSDKLoaded(true);
      } catch (error) {
        console.error("Failed to initialize SDK:", error);
        setIsSDKLoaded(true); // Still mark as loaded to show error state
      }
    }

    initializeSDK();
  }, []); // Only run once on mount

  // --- Early Returns ---
  if (!isSDKLoaded || authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-fartree-window-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-fartree-primary-purple border-t-transparent rounded-full"></div>
          <p className="text-fartree-text-primary">
            {authLoading ? "Authenticating..." : "Loading SDK..."}
          </p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center h-screen bg-fartree-window-background">
        <div className="text-center p-6">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-fartree-text-primary mb-2">
            Authentication Error
          </h2>
          <p className="text-fartree-text-secondary mb-4">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-fartree-primary-purple text-white px-4 py-2 rounded hover:bg-fartree-accent-purple"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // --- Render ---
  // Safe area insets for native mobile app environment
  const safeAreaInsets = context
    ? (
        context as {
          client?: {
            safeAreaInsets?: {
              top?: number;
              bottom?: number;
              left?: number;
              right?: number;
            };
          };
        }
      ).client?.safeAreaInsets
    : undefined;

  return (
    <div
      style={{
        paddingTop: safeAreaInsets?.top ?? 0,
        paddingBottom: safeAreaInsets?.bottom ?? 0,
        paddingLeft: safeAreaInsets?.left ?? 0,
        paddingRight: safeAreaInsets?.right ?? 0,
      }}
    >
      {/* Header should be full width */}
      <Header />

      {/* Main content and footer should be centered */}
      <div className="container py-2 pb-20">
        {/* Main title */}
        <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>

        {/* Tab content rendering */}
        {currentTab === Tab.Home && <HomeTab />}
        {currentTab === Tab.Actions && <ActionsTab />}
        {currentTab === Tab.Context && <ContextTab />}
        {currentTab === Tab.Wallet && <WalletTab />}

        {/* Footer with navigation */}
        <Footer
          activeTab={currentTab as Tab}
          setActiveTab={setCurrentTab}
          showWallet={USE_WALLET}
        />
      </div>
    </div>
  );
}
