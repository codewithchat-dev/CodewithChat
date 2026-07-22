'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Send, CheckCircle2 } from 'lucide-react'

export function EnterpriseForm() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    size: '10-50',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulated submission
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl animate-in fade-in duration-500">
        <CheckCircle2 className="size-12 text-emerald-500 mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-foreground">Request Received!</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
          Thank you, {formData.name}. Our enterprise solutions team will review your request for {formData.company} and contact you at {formData.email} within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md shadow-xl relative overflow-hidden">
      <div className="absolute right-0 top-0 -z-10 h-24 w-24 rounded-full bg-primary/10 blur-[40px] pointer-events-none" />
      
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-foreground">Book an Enterprise Demo</h3>
        <p className="text-xs text-muted-foreground">Discover how CodewithChat can scale your engineering velocity safely.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="ent-name" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Full Name</label>
          <input
            id="ent-name"
            type="text"
            required
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-11 px-4 text-sm rounded-xl border border-border bg-background/50 focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="ent-email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Work Email</label>
          <input
            id="ent-email"
            type="email"
            required
            placeholder="john@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full h-11 px-4 text-sm rounded-xl border border-border bg-background/50 focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ent-company" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Company Name</label>
            <input
              id="ent-company"
              type="text"
              required
              placeholder="Acme Corp"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full h-11 px-4 text-sm rounded-xl border border-border bg-background/50 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="ent-size" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Team Size</label>
            <select
              id="ent-size"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full h-11 px-4 text-sm rounded-xl border border-border bg-background/50 focus:border-primary focus:outline-none transition-colors"
            >
              <option value="10-50">10 - 50 developers</option>
              <option value="50-200">50 - 200 developers</option>
              <option value="200-1000">200 - 1000 developers</option>
              <option value="1000+">1000+ developers</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="ent-message" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Special Requirements</label>
          <textarea
            id="ent-message"
            rows={3}
            placeholder="Tell us about your tech stack, compliance needs, or VPC hosting expectations..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full p-4 text-sm rounded-xl border border-border bg-background/50 focus:border-primary focus:outline-none transition-colors resize-none"
          />
        </div>
      </div>

      <Button type="submit" className="w-full h-11 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
        Submit Request
        <Send className="ml-2 size-4" />
      </Button>
    </form>
  )
}
