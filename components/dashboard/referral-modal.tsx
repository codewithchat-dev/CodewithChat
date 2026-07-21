'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Gift, Copy, Check, Twitter, Send, MessageCircle } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

interface ReferralModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReferralModal({ open, onOpenChange }: ReferralModalProps) {
  const { user } = useUser()
  const [copied, setCopied] = useState(false)

  // Generate a dummy referral link using their Clerk User ID
  const referralLink = `https://codewithchat.com?ref=${user?.id?.substring(5, 15) || 'invite'}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Referral link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnTwitter = () => {
    const text = `I'm building insane AI apps on CodewithChat. Sign up with my link to get free bonus credits!`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`, '_blank')
  }

  const shareOnTelegram = () => {
    const text = `Hey! Check out CodewithChat. It's an AI that builds full-stack apps for you. Use my link to get free credits:`
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareOnWhatsApp = () => {
    const text = `Hey! Check out CodewithChat. It's an AI that builds full-stack apps for you. Use my link to get free credits: ${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center flex flex-col items-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Gift className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">Invite friends, earn credits</DialogTitle>
          <DialogDescription className="text-base mt-2">
            Give a friend bonus credits, and get <span className="font-bold text-foreground">50 Extra Credits</span> for every friend who signs up!
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">Your unique invite link</p>
            <div className="flex items-center gap-2">
              <Input 
                readOnly 
                value={referralLink} 
                className="bg-muted/50 font-mono text-sm"
              />
              <Button size="icon" variant={copied ? "default" : "secondary"} onClick={handleCopy} className="shrink-0 transition-all">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button variant="outline" className="w-full gap-2" onClick={shareOnTwitter}>
              <Twitter className="size-4 text-[#1DA1F2]" />
              Share on Twitter
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full gap-2" onClick={shareOnWhatsApp}>
                <MessageCircle className="size-4 text-[#25D366]" />
                WhatsApp
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={shareOnTelegram}>
                <Send className="size-4 text-[#0088cc]" />
                Telegram
              </Button>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-muted/50 p-4 mt-2">
          <h4 className="text-sm font-semibold mb-2">How it works:</h4>
          <ul className="text-xs text-muted-foreground space-y-2">
            <li className="flex gap-2"><span className="text-primary font-bold">1.</span> Share your link with a developer friend.</li>
            <li className="flex gap-2"><span className="text-primary font-bold">2.</span> They create a free CodewithChat account.</li>
            <li className="flex gap-2"><span className="text-primary font-bold">3.</span> You both instantly receive 50 Extra Credits!</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
