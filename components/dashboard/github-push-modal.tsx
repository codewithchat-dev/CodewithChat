'use client'

import { useState } from 'react'
import { Github, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface GithubPushModalProps {
  files: { path: string; content: string }[]
}

export function GithubPushModal({ files }: GithubPushModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [repoName, setRepoName] = useState('')
  const [token, setToken] = useState('')

  const handlePush = async () => {
    if (!files.length) {
      toast.error('No full stack files available to push. Please generate a project first.')
      return
    }
    if (!repoName.trim() || !token.trim()) {
      toast.error('Please provide both repository name and GitHub PAT.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName: repoName.trim(),
          token: token.trim(),
          files
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to push to GitHub')
      }

      toast.success('Successfully pushed to GitHub!')
      setOpen(false)
    } catch (error: any) {
      console.error('GitHub Push Error:', error)
      toast.error(error.message || 'An error occurred while pushing to GitHub.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-[#24292e] text-white hover:bg-[#24292e]/90">
          <Github className="size-4 mr-2" /> Push to GitHub
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Push to GitHub</DialogTitle>
          <DialogDescription>
            Create a new repository and push your full-stack code instantly.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="repoName">Repository Name</Label>
            <Input
              id="repoName"
              placeholder="e.g. smart-calculator-app"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token">Personal Access Token (PAT)</Label>
            <Input
              id="token"
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Needs 'repo' scope. We do not store your token.
            </p>
          </div>
        </div>
        <Button onClick={handlePush} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Pushing...
            </>
          ) : (
            'Create & Push Repository'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
