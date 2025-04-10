import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-xl mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-6">The page you are looking for doesn't exist or has been moved.</p>
      <Button asChild>
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  )
}
