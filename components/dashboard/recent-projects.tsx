'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Pin, MessageSquare, MoreHorizontal, Trash2 } from 'lucide-react'
import { useProjectHistory } from '@/hooks/use-project-history'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function RecentProjects({ onNavigate }: { onNavigate?: () => void }) {
  const params = useParams()
  const activeProjectId = params?.id as string

  const { pinnedProjects, recentProjects, isLoaded, togglePin, deleteProject, getTimeAgo } = useProjectHistory()

  // Prevent hydration mismatch
  if (!isLoaded) {
    return <div className="flex flex-col gap-6 py-2 px-3 animate-pulse opacity-50">Loading history...</div>
  }

  if (pinnedProjects.length === 0 && recentProjects.length === 0) {
    return (
      <div className="flex flex-col gap-2 py-4 px-3 text-center">
        <p className="text-xs text-muted-foreground">No projects yet.</p>
        <p className="text-[10px] text-muted-foreground opacity-70">Build something amazing!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Pinned Section */}
      {pinnedProjects.length > 0 && (
        <div>
          <h4 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Pinned
          </h4>
          <div className="flex flex-col gap-0.5">
            {pinnedProjects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/project/${project.id}`}
                onClick={onNavigate}
                className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                  activeProjectId === project.id 
                    ? 'bg-primary/15 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
                title={project.title}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Pin className="size-3.5 shrink-0 rotate-45 text-primary fill-primary/20" />
                  <span className="truncate max-w-[140px]">{project.title}</span>
                </div>
                
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} 
                      className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity p-1 rounded hover:bg-muted/80"
                    >
                      <MoreHorizontal className="size-4 shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={4} className="w-40">
                    <DropdownMenuItem onClick={(e) => togglePin(project.id, e as any)}>
                      <Pin className="mr-2 size-4" /> Unpin
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={(e) => deleteProject(project.id, e as any)}>
                      <Trash2 className="mr-2 size-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Section */}
      {recentProjects.length > 0 && (
        <div>
          <h4 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Recent Projects
          </h4>
          <div className="flex flex-col gap-0.5">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/project/${project.id}`}
                onClick={onNavigate}
                className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                  activeProjectId === project.id 
                    ? 'bg-primary/15 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
                title={project.title}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare className="size-3.5 shrink-0 opacity-70" />
                  <span className="truncate max-w-[140px]">{project.title}</span>
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] text-muted-foreground/60 group-hover:hidden transition-all">{getTimeAgo(project.updatedAt)}</span>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} 
                        className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity p-1 rounded hover:bg-muted/80"
                      >
                        <MoreHorizontal className="size-4 shrink-0" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={4} className="w-40">
                      <DropdownMenuItem onClick={(e) => togglePin(project.id, e as any)}>
                        <Pin className="mr-2 size-4" /> Pin Project
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={(e) => deleteProject(project.id, e as any)}>
                        <Trash2 className="mr-2 size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
