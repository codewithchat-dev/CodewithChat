'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Frown, Meh, Smile } from 'lucide-react'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'

interface FeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Rating = 'bad' | 'neutral' | 'good' | null

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const { user } = useUser()
  const [rating, setRating] = useState<Rating>(null)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!rating && !feedback.trim()) {
      toast.error('Please provide a rating or some feedback.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: user?.primaryEmailAddress?.emailAddress || user?.id,
          rating,
          feedback
        })
      })

      if (!response.ok) throw new Error('Failed to submit')
      
      toast.success('Thank you! Your feedback has been sent directly to our Discord server.')
    } catch (e) {
      console.error(e)
      toast.error('Failed to send feedback. Please try again later.')
    } finally {
      setIsSubmitting(false)
      setRating(null)
      setFeedback('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
              <MessageSquare className="size-4 text-primary" />
            </div>
            <DialogTitle>Send Feedback</DialogTitle>
          </div>
          <DialogDescription>
            Help us improve CodewithChat. We read every single message.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Rating Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              How is your experience so far?
            </label>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setRating('bad')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                  rating === 'bad' 
                    ? 'bg-red-500/10 text-red-500 scale-110 border border-red-500/20' 
                    : 'text-muted-foreground hover:bg-muted border border-transparent'
                }`}
              >
                <Frown className="size-8" />
                <span className="text-xs font-medium">Poor</span>
              </button>
              
              <button
                onClick={() => setRating('neutral')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                  rating === 'neutral' 
                    ? 'bg-yellow-500/10 text-yellow-500 scale-110 border border-yellow-500/20' 
                    : 'text-muted-foreground hover:bg-muted border border-transparent'
                }`}
              >
                <Meh className="size-8" />
                <span className="text-xs font-medium">Okay</span>
              </button>

              <button
                onClick={() => setRating('good')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                  rating === 'good' 
                    ? 'bg-green-500/10 text-green-500 scale-110 border border-green-500/20' 
                    : 'text-muted-foreground hover:bg-muted border border-transparent'
                }`}
              >
                <Smile className="size-8" />
                <span className="text-xs font-medium">Great</span>
              </button>
            </div>
          </div>

          {/* Text Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              What should we build or improve next?
            </label>
            <Textarea 
              placeholder="Tell us what you love, what you hate, or what's missing..."
              className="resize-none h-24 bg-muted/50 focus:bg-background transition-colors"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between items-center border-t border-border/50 pt-4">
          <p className="text-[10px] text-muted-foreground hidden sm:block">
            Powered by your ideas
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
