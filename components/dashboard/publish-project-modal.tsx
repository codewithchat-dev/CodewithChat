"use client";

import { useEffect, useRef, useState } from "react";
import {
  ExternalLink,
  Globe,
  Loader2,
  RotateCw,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type PublishState = {
  status: string;
  url?: string | null;
  previousUrl?: string | null;
  error?: string | null;
};

const ACTIVE = new Set([
  "STARTING",
  "QUEUED",
  "INITIALIZING",
  "BUILDING",
  "FINALIZING",
]);

const LABELS: Record<string, string> = {
  IDLE: "Ready to publish",
  STARTING: "Preparing deployment…",
  QUEUED: "Waiting for build…",
  INITIALIZING: "Preparing build…",
  BUILDING: "Building your website…",
  FINALIZING: "Assigning your website address…",
  READY: "Build passed — website published",
  ERROR: "Build or publishing failed",
  CANCELED: "Deployment canceled",
  UNKNOWN: "Deployment needs checking",
};

export function PublishProjectModal({
  projectId,
}: {
  projectId: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<PublishState>({
    status: "IDLE",
  });
  const [checking, setChecking] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<
    string | null
  >(null);
  const [pollKey, setPollKey] = useState(0);

  const postLock = useRef(false);
  const revision = useRef(0);

  const endpoint =
    `/api/vercel/deploy?projectId=${encodeURIComponent(projectId)}`;

  useEffect(() => {
    if (!open || posting) return;

    const controller = new AbortController();
    const current = ++revision.current;
    const started = Date.now();

    let timer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;

    async function poll() {
      setChecking(true);

      try {
        const response = await fetch(endpoint, {
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Could not check publish status.",
          );
        }

        if (
          controller.signal.aborted ||
          current !== revision.current
        ) {
          return;
        }

        failures = 0;
        setState(result);
        setError(null);

        if (ACTIVE.has(result.status)) {
          if (Date.now() - started > 10 * 60 * 1000) {
            setError(
              "Build is still pending. Use Check status to continue without starting another build.",
            );
          } else {
            timer = setTimeout(poll, 3000);
          }
        }
      } catch (err) {
        if (
          controller.signal.aborted ||
          current !== revision.current
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Status check failed.",
        );

        if (++failures < 3) {
          timer = setTimeout(poll, 5000);
        }
      } finally {
        if (
          !controller.signal.aborted &&
          current === revision.current
        ) {
          setChecking(false);
        }
      }
    }

    void poll();

    return () => {
      controller.abort();

      if (timer) clearTimeout(timer);
    };
  }, [open, posting, endpoint, pollKey]);

  async function publish() {
    if (
      postLock.current ||
      ACTIVE.has(state.status) ||
      state.status === "UNKNOWN"
    ) {
      return;
    }

    postLock.current = true;
    revision.current++;

    setPosting(true);
    setRequestError(null);
    setError(null);

    try {
      const response = await fetch("/api/vercel/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not start publishing.",
        );
      }

      setState((previous) => ({
        ...result,
        previousUrl:
          previous.url || previous.previousUrl,
      }));
    } catch (err) {
      setRequestError(
        err instanceof Error
          ? err.message
          : "Publishing request failed.",
      );

      // Recheck server state before allowing another request.
      setState((previous) => ({
        ...previous,
        status: "STARTING",
        url: null,
      }));
    } finally {
      postLock.current = false;
      setPosting(false);
      setPollKey((value) => value + 1);
    }
  }

  const busy = posting || ACTIVE.has(state.status);
  const live = state.status === "READY" ? state.url : null;
  const visibleError = requestError || error || state.error;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="h-8 shrink-0 rounded-full px-4 text-xs font-semibold"
        >
          Publish
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publish your website</DialogTitle>

          <DialogDescription>
            Your saved project is built on Vercel before its
            website address appears.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 text-sm"
          >
            {(busy || checking) && (
              <Loader2 className="size-4 shrink-0 animate-spin" />
            )}

            <span>
              {posting
                ? "Checking files and starting build…"
                : LABELS[state.status] || state.status}
            </span>
          </div>

          {visibleError && (
            <p
              role="alert"
              className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-red-500/10 p-3 text-sm text-red-400"
            >
              {visibleError}
            </p>
          )}

          <div className="flex items-center gap-2 rounded-lg border p-3 text-sm">
            <Globe className="size-4 shrink-0" />

            {live ? (
              <a
                href={live}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all underline underline-offset-4"
              >
                {live}
              </a>
            ) : (
              <span className="text-muted-foreground">
                Your address appears after the build and
                domain assignment succeed.
              </span>
            )}
          </div>

          {!live && state.previousUrl && (
            <a
              href={state.previousUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs underline underline-offset-4"
            >
              Open previously published version
            </a>
          )}

          {live && (
            <Button asChild className="w-full">
              <a
                href={live}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 size-4" />
                Open website
              </a>
            </Button>
          )}

          <div className="flex gap-2">
            <Button
              onClick={publish}
              disabled={
                busy ||
                checking ||
                state.status === "UNKNOWN"
              }
              className="flex-1"
            >
              {busy
                ? "Publishing…"
                : live
                  ? "Publish latest changes"
                  : "Publish website"}
            </Button>

            <Button
              variant="outline"
              onClick={() => setPollKey((value) => value + 1)}
              disabled={posting}
              aria-label="Check publishing status"
              title="Check status"
            >
              <RotateCw className="size-4" />
            </Button>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Save your changes before publishing. A successful
            build does not test every interaction or backend
            connection.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}