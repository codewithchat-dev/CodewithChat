'use client'

import { useEffect, useRef } from 'react'
import { useClerk, useAuth } from '@clerk/nextjs'
import { useSearchParams, useRouter } from 'next/navigation'

export function AutoSignupModal() {
  const { openSignUp, loaded } = useClerk()
  const { isSignedIn, isLoaded: authLoaded } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const opened = useRef(false)

  useEffect(() => {
    const isSignUp = searchParams.get('sign_up') === 'true'
    const redirectUrl = searchParams.get('redirect_url')
    
    if (isSignUp && redirectUrl && loaded && authLoaded && !opened.current) {
      opened.current = true
      
      if (isSignedIn) {
        router.push(redirectUrl)
      } else {
        openSignUp({
          fallbackRedirectUrl: redirectUrl,
          forceRedirectUrl: redirectUrl
        })
      }
    }
  }, [loaded, authLoaded, isSignedIn, openSignUp, searchParams, router])

  return null
}
