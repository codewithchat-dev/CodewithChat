import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center py-24 px-4 bg-background relative">
      <SignIn forceRedirectUrl="/dashboard" />
    </div>
  )
}
