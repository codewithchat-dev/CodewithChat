'use client'

import { useEffect, useRef } from 'react'
import { useClerk } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'

export function AutoSignupModal() {
  const { openSignUp, loaded } = useClerk()
  const searchParams = useSearchParams()
  const opened = useRef(false)

  useEffect(() => {
    const isSignUp = searchParams.get('sign_up') === 'true'
    const redirectUrl = searchParams.get('redirect_url')
    
    if (isSignUp && redirectUrl && loaded && !opened.current) {
      opened.current = true
      openSignUp({
        fallbackRedirectUrl: redirectUrl,
        forceRedirectUrl: redirectUrl
      })
    }
  }, [loaded, openSignUp, searchParams])

  return null
}
