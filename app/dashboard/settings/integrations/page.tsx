import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Github, Figma, Slack, Trello, Plus, ArrowUpRight } from 'lucide-react'

const INTEGRATIONS = [
  {
    name: 'GitHub',
    description: 'Automatically push your generated code to a GitHub repository.',
    icon: Github,
    connected: false,
    color: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
  },
  {
    name: 'Figma',
    description: 'Import UI designs and transform them directly into Next.js code.',
    icon: Figma,
    connected: false,
    color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
  },
  {
    name: 'Slack',
    description: 'Get notified when your team generates or deploys a new application.',
    icon: Slack,
    connected: false,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
  },
  {
    name: 'Trello',
    description: 'Sync your implementation plans and task lists with Trello boards.',
    icon: Trello,
    connected: false,
    color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'
  }
]

export default function IntegrationsSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Connect CodewithChat to your favorite tools and workflows.
          </p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0">
          <Plus className="size-4" />
          Request Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map((integration) => (
          <div key={integration.name} className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-lg ${integration.color}`}>
                <integration.icon className="size-6" />
              </div>
              {integration.connected ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0">Connected</Badge>
              ) : (
                <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground">
                  Connect
                </Button>
              )}
            </div>
            <h3 className="font-semibold text-base mb-1">{integration.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {integration.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center flex flex-col items-center">
        <h3 className="text-lg font-medium mb-2">Build your own integration</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          Use our open API and webhooks to connect CodewithChat to any custom internal tool or service.
        </p>
        <Button variant="secondary" className="gap-2">
          Read API Documentation
          <ArrowUpRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
