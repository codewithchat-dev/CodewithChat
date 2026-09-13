"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Menu } from "lucide-react";

import { SiteLogo } from "@/components/site-logo";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { RecentProjects } from "@/components/dashboard/recent-projects";
import { CreditsCard } from "@/components/dashboard/credits-card";
import { UserDropdown } from "@/components/dashboard/user-dropdown";
import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function ProjectNavigationDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open navigation"
          title="Navigation"
          className="size-9 shrink-0 rounded-lg"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex h-full w-72 max-w-[85vw] flex-col gap-0 border-border/50 bg-background p-0"
      >
        <SheetTitle className="sr-only">
          Dashboard navigation
        </SheetTitle>

        <SheetDescription className="sr-only">
          Navigate to dashboard sections, recent projects, and account options.
        </SheetDescription>

        <div className="flex h-16 shrink-0 items-center border-b border-border/50 pl-5 pr-12">
          <SiteLogo />
        </div>

        <div className="shrink-0 p-3">
          <Button
            asChild
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
            >
              <ArrowLeft className="size-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto px-3 pb-4"
          onClick={(event) => {
            // Close even when selecting the current project's link.
            if (
              !event.defaultPrevented &&
              !event.ctrlKey &&
              !event.metaKey &&
              !event.shiftKey &&
              !event.altKey &&
              event.target instanceof Element &&
              event.target.closest("a[href]")
            ) {
              setOpen(false);
            }
          }}
        >
          <SidebarNav />

          <div className="mx-2 my-4 h-px bg-border/50" />

          <RecentProjects />
        </div>

        <div className="shrink-0 space-y-4 border-t border-border/50 p-4">
          <CreditsCard />

          <div className="flex items-center px-1 pt-1">
            <UserDropdown />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}