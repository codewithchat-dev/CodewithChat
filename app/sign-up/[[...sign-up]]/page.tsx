import { SignUp } from '@clerk/nextjs'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background relative">
      <div className="absolute left-4 top-4 md:left-8 md:top-8">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      <SignUp forceRedirectUrl="/dashboard" />
    </div>
  )
}
