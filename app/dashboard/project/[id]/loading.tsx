import { Spinner } from '@/components/ui/spinner'

export default function ProjectLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm font-medium">Loading workspace...</p>
      </div>
    </div>
  )
}
