import Link from "next/link"
import { Button } from "~/components/ui/Button"
import { WindowFrame } from "~/components/window-frame"
import { AlertCircle, Home, Search, User } from "lucide-react"

export default function UsernameNotFound() {
  return (
    <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-4 font-mono">
      <WindowFrame
        title="Username Not Found"
        className="w-full max-w-md mx-auto h-[calc(100vh-4rem)] flex flex-col"
      >
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-fartree-window-background">
          <User className="w-16 h-16 text-fartree-text-secondary mb-6" />
          
          <h1 className="text-2xl font-bold text-fartree-text-primary mb-2">Username Not Found</h1>
          
          <p className="text-fartree-text-secondary mb-6 max-w-xs">
            No Fartree profile found with this username. The user may not have created a profile yet.
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
            <p>Tip: You can also access profiles by FID</p>
            <p>Example: /profile/12345</p>
          </div>
        </div>
        
        <footer className="p-4 border-t-2 border-fartree-border-dark text-fartree-text-secondary text-xs text-center bg-fartree-window-header">
          <p>Powered by Fartree</p>
        </footer>
      </WindowFrame>
    </div>
  )
}
