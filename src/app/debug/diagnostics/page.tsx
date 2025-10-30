"use client";

import { useState, useEffect } from "react";
import { WindowFrame } from "~/components/window-frame";
import { Button } from "~/components/ui/Button";
import { useAuth } from "~/contexts/AuthContext";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface DiagnosticResult {
  test: string;
  status: "pass" | "fail" | "warning" | "loading";
  message: string;
  details?: unknown;
}

export default function DiagnosticsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);

  const addResult = (result: DiagnosticResult) => {
    setResults((prev) => [...prev, result]);
  };

  const runDiagnostics = async () => {
    setResults([]);
    setRunning(true);

    try {
      // Test 1: Check if API routes work
      addResult({
        test: "API Routes",
        status: "loading",
        message: "Testing API connectivity...",
      });

      try {
        const apiTest = await fetch("/api/debug/test-navigation");
        const apiData = await apiTest.json();
        addResult({
          test: "API Routes",
          status: "pass",
          message: "API routes are working",
          details: apiData,
        });
      } catch (err) {
        addResult({
          test: "API Routes",
          status: "fail",
          message: "API routes failed",
          details: err,
        });
      }

      // Test 2: List all profiles
      addResult({
        test: "Database Profiles",
        status: "loading",
        message: "Fetching profiles from database...",
      });

      try {
        const profilesResponse = await fetch("/api/debug/list-profiles");
        const profilesData = await profilesResponse.json();
        
        if (profilesData.success) {
          addResult({
            test: "Database Profiles",
            status: profilesData.total_profiles > 0 ? "pass" : "warning",
            message: `Found ${profilesData.total_profiles} profiles in database`,
            details: profilesData.profiles?.slice(0, 5), // Show first 5
          });
        } else {
          addResult({
            test: "Database Profiles",
            status: "fail",
            message: "Failed to fetch profiles",
            details: profilesData,
          });
        }
      } catch (err) {
        addResult({
          test: "Database Profiles",
          status: "fail",
          message: "Database query failed",
          details: err,
        });
      }

      // Test 3: Check your own profile
      if (user?.fid) {
        addResult({
          test: "Your Profile",
          status: "loading",
          message: `Checking profile for FID ${user.fid}...`,
        });

        try {
          const ownProfileResponse = await fetch(
            `/api/debug/profile-check?fid=${user.fid}`
          );
          const ownProfileData = await ownProfileResponse.json();

          if (ownProfileData.exists) {
            addResult({
              test: "Your Profile",
              status: "pass",
              message: `Your profile exists with ${ownProfileData.profile.link_count} links`,
              details: ownProfileData.profile,
            });
          } else {
            addResult({
              test: "Your Profile",
              status: "warning",
              message: "Your profile doesn't exist yet",
              details: ownProfileData,
            });
          }
        } catch (err) {
          addResult({
            test: "Your Profile",
            status: "fail",
            message: "Failed to check your profile",
            details: err,
          });
        }
      }

      // Test 4: Check discover API
      if (user?.fid) {
        addResult({
          test: "Discover API",
          status: "loading",
          message: "Fetching your friends...",
        });

        try {
          const discoverResponse = await fetch(
            `/api/discover/friends?fid=${user.fid}&limit=20`
          );
          const discoverData = await discoverResponse.json();

          if (discoverData.success) {
            addResult({
              test: "Discover API",
              status: discoverData.fartree_count > 0 ? "pass" : "warning",
              message: `Found ${discoverData.fartree_count} friends with Fartrees out of ${discoverData.total_friends} total friends`,
              details: {
                total_friends: discoverData.total_friends,
                fartree_count: discoverData.fartree_count,
                sample_friends: discoverData.friends_with_fartree?.slice(0, 3),
              },
            });
          } else {
            addResult({
              test: "Discover API",
              status: "fail",
              message: "Discover API failed",
              details: discoverData,
            });
          }
        } catch (err) {
          addResult({
            test: "Discover API",
            status: "fail",
            message: "Failed to fetch friends",
            details: err,
          });
        }
      }
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    if (user?.fid) {
      runDiagnostics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.fid]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "fail":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "loading":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-fartree-background flex flex-col items-center p-4 font-mono">
      <WindowFrame
        title="Fartree Diagnostics"
        className="w-full max-w-4xl mx-auto"
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-fartree-text-primary mb-2">
                System Diagnostics
              </h1>
              <p className="text-fartree-text-secondary text-sm">
                {user?.fid ? `Logged in as FID ${user.fid}` : "Not logged in"}
              </p>
            </div>
            <Button
              onClick={runDiagnostics}
              disabled={running}
              className="bg-fartree-primary-purple hover:bg-fartree-accent-purple"
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                "Run Tests"
              )}
            </Button>
          </div>

          <div className="space-y-4">
            {results.length === 0 && !running && (
              <div className="text-center py-12 text-fartree-text-secondary">
                <p>Click &quot;Run Tests&quot; to start diagnostics</p>
              </div>
            )}

            {results.map((result, index) => (
              <div
                key={index}
                className="border-2 border-fartree-border-dark rounded-lg p-4 bg-fartree-window-background"
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-fartree-text-primary mb-1">
                      {result.test}
                    </h3>
                    <p className="text-sm text-fartree-text-secondary mb-2">
                      {result.message}
                    </p>
                    {result.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-fartree-primary-purple hover:underline">
                          Show details
                        </summary>
                        <pre className="mt-2 p-2 bg-black/20 rounded overflow-x-auto">
                          {JSON.stringify(result.details as Record<string, unknown>, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 border-2 border-fartree-border-dark rounded-lg bg-fartree-window-header">
            <h3 className="font-semibold text-fartree-text-primary mb-2">
              Common Issues
            </h3>
            <ul className="text-sm text-fartree-text-secondary space-y-2 list-disc list-inside">
              <li>
                <strong>No profiles found:</strong> Your friends haven&apos;t created
                Fartrees yet
              </li>
              <li>
                <strong>0 friends with Fartrees:</strong> None of your 20 best
                friends have profiles
              </li>
              <li>
                <strong>API routes fail:</strong> Check Vercel deployment and
                environment variables
              </li>
              <li>
                <strong>Database errors:</strong> Check DATABASE_URL is set
                correctly
              </li>
            </ul>
          </div>
        </div>
      </WindowFrame>
    </div>
  );
}

