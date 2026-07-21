'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Eye, Code2, Database, BookOpen, Terminal, ExternalLink,
  RotateCw, Download, MoreHorizontal, Github, Settings,
  Pin, PinOff, Pencil, Check, X, Share2, Rocket,
  Monitor, Tablet, Smartphone, FileCode2,
  Zap, Lock, Slash, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { toast } from 'sonner'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { ShareProjectModal } from '@/components/dashboard/share-project-modal'
import { PublishProjectModal } from '@/components/dashboard/publish-project-modal'
import { ProjectGuide } from '@/components/dashboard/project-guide'
import { experimental_useObject } from '@ai-sdk/react'
import { planSchema } from '@/lib/schema'
import { z } from 'zod'
import { useProjectHistory } from '@/hooks/use-project-history'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { PromptComposer } from '@/components/dashboard/prompt-composer'
import { getCreditsAction } from '@/app/actions/credits'
import { MAX_DAILY_CREDITS } from '@/lib/credits'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BuildActivityFeed } from '@/components/dashboard/build-activity-feed'
import { getProjectByIdAction, updateProjectAction, togglePinProjectAction, renameProjectAction } from '@/app/actions/projects'

import { buildFullStackFiles, hasFullStackProject } from '@/lib/fullstack-files'
import { isNextJsStack } from '@/lib/project-structure'
import { isTrivialMessage, shouldRegenerateCode } from '@/lib/chat-intent'

type CodeSource = 'preview' | 'fullstack'

const WebIDE = dynamic(
  () => import('@/components/ide/WebIDE').then(mod => mod.WebIDE),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
        <Spinner className="size-8 text-primary" />
      </div>
    ),
  },
)

type IdeMode = 'sandpack' | 'full'

// ─── Main Page ─────────────────────────────────────────────────
export default function ProjectPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params.id as string

  // Project data
  const [idea, setIdea] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [tech] = useState(searchParams.get('tech') || 'React + Tailwind')
  const [platform] = useState(searchParams.get('platform') || 'Website')
  const [agent] = useState(searchParams.get('agent') || 'Gemini 3.5 Flash')
  const [credits, setCredits] = useState(MAX_DAILY_CREDITS)
  const [projectNotFound, setProjectNotFound] = useState(false)
  const [projectLoading, setProjectLoading] = useState(true)

  // Rename state
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const renameRef = useRef<HTMLInputElement>(null)

  // Chat
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [chatPanelOpen, setChatPanelOpen] = useState(true)

  // Preview state
  const [genError, setGenError] = useState<string | null>(null)
  const [buildStartedAt, setBuildStartedAt] = useState<number | null>(null)
  const [buildDurationMs, setBuildDurationMs] = useState<number | null>(null)
  const [buildCompletedAt, setBuildCompletedAt] = useState<number | null>(null)
  const [projectUpdatedAt, setProjectUpdatedAt] = useState<Date | null>(null)
  const [chatLoading, setChatLoading] = useState(false)
  const buildStartedAtRef = useRef<number | null>(null)

  // Plan
  const [mergedDependencies, setMergedDependencies] = useState<Record<string, string>>({})
  const [localPlan, setLocalPlan] = useState<z.infer<typeof planSchema> | null>(null)
  const { syncHistory } = useProjectHistory()

  const { object: plan, submit, isLoading: loading } = experimental_useObject({
    api: '/api/generate-plan',
    schema: planSchema,
    onFinish: () => {
      console.log('[CodewithChat] Generation finished successfully')
      setGenError(null)
      const finishedAt = Date.now()
      if (buildStartedAtRef.current) {
        const ms = finishedAt - buildStartedAtRef.current
        setBuildDurationMs(ms)
        setBuildCompletedAt(finishedAt)
        setProjectUpdatedAt(new Date(finishedAt))
      }
      setMessages(prev => {
        let durationLabel = 'Your preview is ready.'
        if (buildStartedAtRef.current) {
          const s = Math.max(1, Math.floor((finishedAt - buildStartedAtRef.current) / 1000))
          const workedFor = s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
          durationLabel = `Done! Worked for ${workedFor}. Preview + project files ready.`
        }
        if (prev.length > 0 && prev[prev.length - 1].role === 'user') {
          return [...prev, { role: 'assistant', content: durationLabel }]
        }
        return prev
      })
    },
    onError: (err) => {
      console.error('[CodewithChat] Generation error:', err)
      const errMsg = err?.message || 'Unknown error'
      setGenError(errMsg)
      if (errMsg.includes('NO_CREDITS') || errMsg.includes('402')) {
        setCredits(0)
        toast.error('Daily credits used up. Upgrade to continue building.')
      } else {
        toast.error('Failed to generate plan. Please try again.')
      }
      setMessages(prev => {
        if (prev.length > 0 && prev[prev.length - 1].role === 'user') {
          return prev.slice(0, -1)
        }
        return prev
      })
    },
  })

  const activePlan = (plan || localPlan) as z.infer<typeof planSchema> | null

  const refreshCredits = () => {
    getCreditsAction().then(res => {
      if (res.success) {
        setCredits(res.credits)
        window.dispatchEvent(new Event('credits-updated'))
      }
    })
  }

  useEffect(() => {
    refreshCredits()
  }, [])

  useEffect(() => {
    if (!loading) refreshCredits()
  }, [loading])

  // Track build duration for activity feed
  useEffect(() => {
    if (loading) {
      const now = Date.now()
      buildStartedAtRef.current = now
      setBuildStartedAt(now)
      setBuildDurationMs(null)
      setBuildCompletedAt(null)
      return
    }
    if (buildStartedAtRef.current && !buildCompletedAt) {
      const finishedAt = Date.now()
      setBuildDurationMs(finishedAt - buildStartedAtRef.current)
      setBuildCompletedAt(finishedAt)
    }
  }, [loading, buildCompletedAt])

  // Merge streaming dependencies
  useEffect(() => {
    if (activePlan?.dependencies) {
      setMergedDependencies(prev => ({ ...prev, ...activePlan?.dependencies }))
    }
  }, [activePlan?.dependencies])



  // Load project on mount
  useEffect(() => {
    if (projectId) {
      console.log('[CodewithChat] Loading project:', projectId)
      setProjectLoading(true)
      getProjectByIdAction(projectId)
        .then(res => {
          setProjectLoading(false)
          if (res.success && res.data) {
            console.log('[CodewithChat] Project loaded. Has code:', !!res.data.code)
            setIdea(res.data.prompt)
            setProjectTitle(res.data.title)
            setIsPinned(res.data.isPinned || false)
            if (res.data.updatedAt) {
              setProjectUpdatedAt(new Date(res.data.updatedAt))
            }
            if (res.data.code) {
              try {
                const parsed = JSON.parse(res.data.code)
                console.log('[CodewithChat] Parsed plan. previewFiles:', parsed?.previewFiles?.length || 0)
                setLocalPlan(parsed)
              } catch (err) {
                console.error('[CodewithChat] Failed to parse project code:', err)
                // Code is corrupted, trigger regeneration
                console.log('[CodewithChat] Triggering regeneration due to parse error')
                submit({ idea: res.data.prompt, tech, platform, messages: [] })
              }
            } else {
              console.log('[CodewithChat] No code saved, checking credits before generation...')
              getCreditsAction().then(creditRes => {
                if (creditRes.success) setCredits(creditRes.credits)
                if (creditRes.success && creditRes.credits > 0) {
                  submit({ idea: res.data.prompt, tech, platform, messages: [] })
                } else {
                  toast.error('Daily credits used up. Upgrade to generate this project.')
                }
              })
            }
          } else {
            console.log('[CodewithChat] Project not found or unauthorized')
            setProjectNotFound(true)
          }
        })
        .catch((err) => {
          console.error('[CodewithChat] Failed to load project:', err)
          setProjectLoading(false)
          setProjectNotFound(true)
        })
    }
  }, [projectId])

  // Focus rename input
  useEffect(() => {
    if (isRenaming && renameRef.current) {
      renameRef.current.focus()
      renameRef.current.select()
    }
  }, [isRenaming])

  // ─── Handlers ──────────────────────────────────────────
  async function handleChatOnly(userMessage: string, history: { role: string; content: string }[]) {
    setChatLoading(true)
    try {
      const res = await fetch('/api/project-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          idea,
          tech,
          platform,
          messages: history,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Chat failed')
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      toast.error('Could not get a reply. Try again.')
      setMessages(prev => (prev[prev.length - 1]?.role === 'user' ? prev.slice(0, -1) : prev))
    } finally {
      setChatLoading(false)
    }
  }

  async function handleSendChat() {
    if (!idea.trim()) return
    const trimmed = chatInput.trim()
    if (isTrivialMessage(trimmed)) {
      toast.error('Please ask a question or describe a real change (not just ".").')
      return
    }

    const userMsg = { role: 'user', content: trimmed }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setChatInput('')

    if (!shouldRegenerateCode(trimmed)) {
      await handleChatOnly(trimmed, nextMessages)
      return
    }

    if (credits <= 0) {
      toast.error('Daily credits used up. Upgrade to continue building.')
      return
    }

    const existingPlan = (plan || localPlan) as z.infer<typeof planSchema> | null
    if (existingPlan) setLocalPlan(existingPlan)

    submit({
      idea,
      tech,
      platform,
      messages: nextMessages,
      existingPlan,
    })
  }

  function handleRegenerateProject() {
    if (!idea.trim()) return
    if (credits <= 0) {
      toast.error('Daily credits used up. Upgrade to continue building.')
      return
    }
    setGenError(null)
    setMessages([])
    setMergedDependencies({})
    submit({ idea, tech, platform, messages: [] })
  }

  const handleDownloadZip = async () => {
    if (!activePlan || !activePlan.fullStackFiles?.length) {
      toast.error('No code available to download.')
      return
    }
    try {
      const zip = new JSZip()
      activePlan.fullStackFiles.forEach(file => {
        const filePath = file.path.startsWith('/') ? file.path.substring(1) : file.path
        zip.file(filePath, file.content)
      })
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `${projectTitle || 'project'}.zip`)
      toast.success('Downloaded project ZIP!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate ZIP file.')
    }
  }

  const handleTogglePin = async () => {
    const newVal = !isPinned
    setIsPinned(newVal)
    const res = await togglePinProjectAction(projectId, newVal)
    if (!res.success) {
      setIsPinned(!newVal)
      toast.error('Failed to update pin.')
    }
  }

  const handleRename = async () => {
    if (!renameValue.trim() || renameValue.trim() === projectTitle) {
      setIsRenaming(false)
      return
    }
    const res = await renameProjectAction(projectId, renameValue.trim())
    if (res.success) {
      setProjectTitle(renameValue.trim())
      toast.success('Project renamed.')
    } else {
      toast.error('Failed to rename.')
    }
    setIsRenaming(false)
  }

  // ─── Build files object ────────────────────────
  const fullStackFileMap = buildFullStackFiles(activePlan?.fullStackFiles)
  const fullIdeReady = hasFullStackProject(fullStackFileMap)

  // Save to DB when generation finishes
  useEffect(() => {
    if (!loading && plan && projectId) {
      updateProjectAction(projectId, JSON.stringify(plan))
    }
  }, [loading, plan, projectId])

  // ─── Not Found ─────────────────────────────────────────
  if (projectNotFound) {
    return (
      <div className="flex h-full min-h-screen flex-col items-center justify-center gap-6 bg-background text-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted border border-border shadow-sm">
            <FileCode2 className="size-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Project Not Found</h1>
          <p className="text-muted-foreground max-w-sm text-sm">
            This project doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>
    )
  }

  // ─── RENDER ────────────────────────────────────────────
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-full min-h-0 overflow-hidden">
        {/* ═══════════════ TOP HEADER BAR ═══════════════ */}
        <div className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          {/* Left: Project Name + Pin + Rename + Settings */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Project Name (editable) */}
            {isRenaming ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={renameRef}
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRename()
                    if (e.key === 'Escape') setIsRenaming(false)
                  }}
                  className="h-7 w-40 rounded-md border border-border bg-muted/50 px-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button onClick={handleRename} className="p-1 rounded hover:bg-muted text-green-500">
                  <Check className="size-3.5" />
                </button>
                <button onClick={() => setIsRenaming(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-sm font-semibold truncate max-w-[200px]" title={projectTitle}>
                {projectTitle || 'Untitled Project'}
              </span>
            )}

            {/* Pin */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleTogglePin} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  {isPinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">{isPinned ? 'Unpin' : 'Pin'} project</TooltipContent>
            </Tooltip>

            {/* Rename & Settings dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <Settings className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44 text-sm">
                <DropdownMenuItem onClick={() => { setRenameValue(projectTitle); setIsRenaming(true) }}>
                  <Pencil className="mr-2 size-3.5" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 size-3.5" /> Project Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: Publish + Share + 3-dot */}
          <div className="flex items-center gap-1.5 shrink-0">
            <PublishProjectModal projectId={projectId} />
            <ShareProjectModal projectId={projectId} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-sm font-medium">
                <DropdownMenuItem>
                  <Github className="mr-2 size-4" /> Connect GitHub
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileCode2 className="mr-2 size-4" /> Open in VS Code
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDownloadZip}>
                  <Download className="mr-2 size-4" /> Download ZIP
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ═══════════════ MAIN CONTENT ═══════════════ */}
        <div className="flex-1 min-h-0 flex">
          {/* ─── LEFT: Chat Panel ─── */}
          <div
            className={`border-r border-border flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
              chatPanelOpen ? 'w-[360px] min-w-[300px] max-w-[420px] opacity-100' : 'w-0 min-w-0 opacity-0 border-r-0'
            }`}
          >
            {/* Chat messages — scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              <div className="flex flex-col gap-3">
                <div className="bg-primary/10 text-primary p-3 rounded-lg text-sm rounded-tl-none">
                  {idea ? `Building: ${idea}` : 'Loading project...'}
                </div>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg text-sm max-w-[90%] whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground self-end rounded-tr-none ml-auto'
                        : 'bg-muted text-foreground self-start rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
            </div>

            {/* Agent activity — fixed above typing box */}
            {(loading || activePlan?.overview || activePlan?.steps?.length) && (
              <div className="shrink-0 border-t border-border bg-card/80 backdrop-blur-sm px-3 pt-2 pb-1">
                <BuildActivityFeed
                  plan={activePlan ?? undefined}
                  loading={loading}
                  idea={idea}
                  startedAt={buildStartedAt}
                  durationMs={buildDurationMs}
                  completedAt={buildCompletedAt}
                  fallbackUpdatedAt={projectUpdatedAt}
                  compact
                />
              </div>
            )}

            {/* Input area — same composer as dashboard home */}
            <div className="shrink-0 p-3 border-t border-border bg-muted/20">
              <PromptComposer
                value={chatInput}
                onChange={setChatInput}
                onSubmit={handleSendChat}
                loading={loading || chatLoading}
                credits={credits}
                maxCredits={MAX_DAILY_CREDITS}
                agent={agent}
                tech={tech}
                platform={platform}
                compact
                showCreditsBar
                requiresCredit
                allowInputWhenExhausted
                submitHint={
                  shouldRegenerateCode(chatInput) && chatInput.trim()
                    ? 'Send code update'
                    : 'Ask AI'
                }
                placeholder='Ask a question or request a change… e.g. "How do I integrate a backend?" or "Add Supabase login"'
              />
            </div>
          </div>

          {/* ─── RIGHT: Preview / Code / Guide ─── */}
          <div className="flex-1 min-w-0 flex flex-col h-full">
            {/* Loading states */}
            {!activePlan && projectLoading && (
              <div className="flex h-full items-center justify-center">
                <Spinner className="size-8 text-primary" />
              </div>
            )}
            {!activePlan && loading && !projectLoading && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <Spinner className="size-6" />
                <p className="text-sm">Generating your project...</p>
              </div>
            )}
            {/* Fallback: generation failed or no plan saved */}
            {!activePlan && !loading && !projectLoading && (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted border border-border">
                  <Zap className="size-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">
                    {genError ? 'Generation Failed' : 'No preview yet'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {genError
                      ? genError
                      : "Click below to generate your project preview."}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setGenError(null)
                    handleRegenerateProject()
                  }}
                  disabled={!idea.trim()}
                  className="gap-2"
                >
                  <Zap className="size-4" />
                  {genError ? 'Retry Generation' : 'Generate Project'}
                </Button>
              </div>
            )}

            {activePlan && (
              <>
                {/* ─── Toolbar ─── */}
                <div className="h-11 border-b border-border bg-card/80 backdrop-blur flex items-center gap-1 px-3 shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setChatPanelOpen(open => !open)}
                        className={`p-1.5 rounded-md transition-colors shrink-0 ${
                          chatPanelOpen
                            ? 'text-foreground bg-muted'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                        aria-label={chatPanelOpen ? 'Hide chat panel' : 'Show chat panel'}
                      >
                        {chatPanelOpen ? (
                          <PanelLeftClose className="size-3.5" />
                        ) : (
                          <PanelLeftOpen className="size-3.5" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {chatPanelOpen ? 'Hide chat & activity' : 'Show chat & activity'}
                    </TooltipContent>
                  </Tooltip>

                  <div className="w-px h-5 bg-border shrink-0 ml-1" />
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground ml-2">
                    <Terminal className="size-3.5 text-primary" />
                    <span className="font-medium text-foreground">Full IDE</span>
                    <span className="hidden sm:inline">— real terminal, npm, dev server</span>
                  </div>
                </div>

                {/* ─── Full IDE Content ─── */}
                <div className="flex-1 min-h-0 relative">
                  {fullIdeReady ? (
                    <div className="absolute inset-0 z-10">
                      <WebIDE key={projectId} files={fullStackFileMap} />
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-6 bg-background">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted border border-border">
                        <Terminal className="size-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold mb-1">Full IDE not available</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          No package.json found in fullStackFiles. Regenerate the project to unlock the real terminal IDE.
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setGenError(null)
                          handleRegenerateProject()
                        }}
                        disabled={loading || !idea.trim()}
                        className="gap-2"
                      >
                        <Zap className="size-4" />
                        Regenerate Project
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
