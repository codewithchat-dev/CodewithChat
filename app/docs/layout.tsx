import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'
import { DocsSidebar } from '@/components/docs/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      
      <div className="flex-1 max-w-[1400px] w-full mx-auto md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr] gap-6 lg:gap-10">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:block fixed top-16 z-30 -ml-2 w-full shrink-0 md:sticky md:h-[calc(100vh-4rem)]">
          <ScrollArea className="h-full py-6 pr-6 lg:py-8 border-r border-border/40">
            <DocsSidebar />
          </ScrollArea>
        </aside>

        {/* Mobile Header Toggle */}
        <div className="md:hidden border-b border-border/40 p-4 sticky top-16 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-muted-foreground gap-2">
                <Menu className="size-4" />
                Documentation Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 pr-0">
              <SheetTitle className="sr-only">Documentation Menu</SheetTitle>
              <ScrollArea className="h-full py-6 pr-6">
                <DocsSidebar />
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content Area */}
        <main className="flex w-full flex-col overflow-hidden px-4 md:px-0">
          {children}
        </main>
      </div>
      
      <SiteFooter />
    </div>
  )
}
