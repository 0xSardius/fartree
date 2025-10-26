import Link from "next/link"
import { Button } from "~/components/ui/Button"
import { WindowFrame } from "~/components/window-frame"
import { AlertCircle, Home, Search } from "lucide-react"

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
      <WindowFrame
        title="Profile Not Found"
        className="w-full max-w-md mx-auto h-[calc(100vh-4rem)] flex flex-col"
      >
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-fartree-window-background">
          <AlertCircle className="w-16 h-16 text-fartree-text-secondary mb-6" />
          
          <h1 className="text-2xl font-bold text-fartree-text-primary mb-2">Profile Not Found</h1>
          
          <p className="text-fartree-text-secondary mb-6 max-w-xs">
            This Fartree profile doesn&apos;t exist or hasn&apos;t been created yet.
          </p>
          
          <div className="space-y-3 w-full max-w-xs">
            <Link href="/">
              <Button className="w-full bg-fartree-primary-purple hover:bg-fartree-accent-purple text-fartree-text-primary">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
            
            <Link href="/onboarding">
              <Button
                variant="outline"
                className="w-full border-fartree-border-dark text-fartree-text-primary hover:bg-fartree-window-background"
              >
                <Search className="w-4 h-4 mr-2" />
                Create Your Fartree
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 text-xs text-fartree-text-secondary">
            <p>Looking for someone specific?</p>
            <p>Make sure you have the correct FID or username.</p>
          </div>
        </div>
        
        <footer className="p-4 border-t-2 border-fartree-border-dark text-fartree-text-secondary text-xs text-center bg-fartree-window-header">
          <p>Powered by Fartree</p>
        </footer>
      </WindowFrame>
    </div>
  )
}
