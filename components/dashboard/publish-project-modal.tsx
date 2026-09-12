"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Lock, Globe, ArrowRight, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";

export function PublishProjectModal({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);

  const handlePublish = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/vercel/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(result.error || "Vercel deployment failed.");
      }

      setDeploymentUrl(result.url);
      toast.success("Deployment started successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Vercel deployment failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="h-8 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 hidden xl:flex shrink-0"
            >
              Publish
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Publish project
        </TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md shadow-2xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl">Publish Project</DialogTitle>
          <DialogDescription className="text-sm">
            Make your application live on the internet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* URL Section */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-foreground">
              Your website URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center bg-muted/30 border border-border/50 rounded-md px-3 py-2.5">
                <Globe className="size-4 text-muted-foreground mr-2 shrink-0" />
                {deploymentUrl ? (
                  <a
                    href={deploymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-sm font-semibold text-primary hover:underline"
                  >
                    {deploymentUrl}
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Not deployed yet
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your source code stays in the private deployment account. Public
              URL protection depends on your Vercel plan.
            </p>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* Custom Domain Section (Locked) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                Custom Domain
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm">
                  Pro
                </span>
              </h4>
              <Lock className="size-3.5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Connect your own custom domain (e.g. yourname.com) to this
              project.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full justify-between h-9 group border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-500/5"
            >
              <Link href="/dashboard/settings/billing">
                <span className="text-indigo-500 font-medium">
                  Upgrade to Pro to unlock
                </span>
                <ArrowRight className="size-3.5 text-indigo-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Action Button */}
          {deploymentUrl ? (
            <Button
              asChild
              className="w-full h-10 font-semibold shadow-sm hover:shadow-md transition-all"
            >
              <a href={deploymentUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 size-4" />
                Open deployed app
              </a>
            </Button>
          ) : (
            <Button
              className="w-full h-10 font-semibold shadow-sm hover:shadow-md transition-all"
              onClick={handlePublish}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deploying to Vercel...
                </>
              ) : (
                "Deploy to Vercel"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
