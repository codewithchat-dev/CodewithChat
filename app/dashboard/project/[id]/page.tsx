"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  Eye,
  Code2,
  BookOpen,
  ExternalLink,
  RotateCw,
  Download,
  MoreHorizontal,
  Github,
  Settings,
  Pin,
  PinOff,
  Pencil,
  Check,
  X,
  FileCode2,
  Monitor,
  Smartphone,
  Tablet,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  Gift,
  Home,
  LayoutDashboard,
  ChevronDown,
  Coins,
  LogOut,
} from "lucide-react";

import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { experimental_useObject } from "@ai-sdk/react";
import { z } from "zod";

import { ShareProjectModal } from "@/components/dashboard/share-project-modal";
import { PublishProjectModal } from "@/components/dashboard/publish-project-modal";
import { ProjectGuide } from "@/components/dashboard/project-guide";
import {
  BuildActivityFeed,
  buildActivitiesFromPlan,
} from "@/components/dashboard/build-activity-feed";
import type { FileSource } from "@/components/dashboard/build-activity-feed";
import { PromptComposer } from "@/components/dashboard/prompt-composer";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { planSchema } from "@/lib/schema";

import {
  buildInstantPreviewFiles,
  hasPreviewEntry,
  getProjectRuntimeDependencies,
  sanitizeGeneratedProjectFiles,
  mergeGeneratedProjectFiles,
} from "@/lib/preview-files";

import { buildFullStackFiles } from "@/lib/fullstack-files";

import { isTrivialMessage, shouldRegenerateCode } from "@/lib/chat-intent";

import { DEFAULT_TECH_STACK, DEFAULT_PLATFORM } from "@/lib/project-structure";

import {
  getProjectByIdAction,
  updateProjectAction,
  togglePinProjectAction,
  renameProjectAction,
} from "@/app/actions/projects";

import { getCreditsAction } from "@/app/actions/credits";
import { MAX_DAILY_CREDITS } from "@/lib/credits";

import type {
  SandpackView,
  ViewportSize,
} from "@/components/ide/SandpackPreview";

type Plan = z.infer<typeof planSchema>;

type ChatMessage = {
  role: string;
  content: string;
};

// ─────────────────────────────────────────────────────────────
// SANDPACK
// ─────────────────────────────────────────────────────────────

const SandpackPreview = dynamic(
  () =>
    import("@/components/ide/SandpackPreview").then(
      (mod) => mod.SandpackPreview,
    ),
  {
    ssr: false,

    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#151515]">
        <Spinner className="size-8 text-primary" />
      </div>
    ),
  },
);

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function ProjectPage() {
  const params = useParams();

  const projectId = params.id as string;

  // Canonical generated stack
  const tech = DEFAULT_TECH_STACK;
  const platform = DEFAULT_PLATFORM;

  // ───────────────────────────────────────────────────────────
  // PROJECT DATA
  // ───────────────────────────────────────────────────────────

  const [idea, setIdea] = useState("");

  const [projectTitle, setProjectTitle] = useState("");

  const [isPinned, setIsPinned] = useState(false);

  const [credits, setCredits] = useState(MAX_DAILY_CREDITS);

  const [projectNotFound, setProjectNotFound] = useState(false);

  const [projectLoading, setProjectLoading] = useState(true);

  // ───────────────────────────────────────────────────────────
  // RENAME
  // ───────────────────────────────────────────────────────────

  const [isRenaming, setIsRenaming] = useState(false);

  const [renameValue, setRenameValue] = useState("");

  const renameRef = useRef<HTMLInputElement>(null);

  // ───────────────────────────────────────────────────────────
  // CHAT
  // ───────────────────────────────────────────────────────────

  const [chatInput, setChatInput] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [chatPanelOpen, setChatPanelOpen] = useState(true);

  const [chatLoading, setChatLoading] = useState(false);

  // ───────────────────────────────────────────────────────────
  // GENERATION
  // ───────────────────────────────────────────────────────────

  const [genError, setGenError] = useState<string | null>(null);

  const [buildStartedAt, setBuildStartedAt] = useState<number | null>(null);

  const [buildDurationMs, setBuildDurationMs] = useState<number | null>(null);

  const [buildCompletedAt, setBuildCompletedAt] = useState<number | null>(null);

  const [projectUpdatedAt, setProjectUpdatedAt] = useState<Date | null>(null);

  const buildStartedAtRef = useRef<number | null>(null);

  /**
   * Used to make sure a completed generated plan
   * is committed only once.
   */
  const generationInFlightRef = useRef(false);
  const incrementalUpdateRef = useRef(false);

  /**
   * Prevent duplicate project loading/generation
   * during React development Strict Mode.
   */
  const loadedProjectRef = useRef<string | null>(null);

  // ───────────────────────────────────────────────────────────
  // PREVIEW UI
  // ───────────────────────────────────────────────────────────

  const [view, setView] = useState<SandpackView>("preview");

  const [previewKey, setPreviewKey] = useState(0);

  const [isRefreshingPreview, setIsRefreshingPreview] = useState(false);

  const [previewError, setPreviewError] = useState<string | null>(null);

  const handleRefreshPreview = useCallback(() => {
    if (isRefreshingPreview) return;

    setIsRefreshingPreview(true);
    setPreviewError(null);

    setPreviewKey((current) => current + 1);

    window.setTimeout(() => {
      setIsRefreshingPreview(false);
    }, 800);
  }, [isRefreshingPreview]);

  const handlePreviewError = useCallback((message: string) => {
    setPreviewError(message);
  }, []);

  const [rightPanel, setRightPanel] = useState<"preview" | "guide">("preview");

  const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop");

  const [activeFile, setActiveFile] = useState<string | null>(null);

  const handleOpenFile = useCallback((path: string) => {
    setView("code");
    setActiveFile(path);
    setRightPanel("preview");
  }, []);

  // ───────────────────────────────────────────────────────────
  // COMPLETE STABLE PLAN
  // ───────────────────────────────────────────────────────────

  /**
   * IMPORTANT:
   *
   * localPlan always represents the LAST COMPLETE project.
   *
   * The streaming `plan` from experimental_useObject is NOT
   * sent directly to Sandpack.
   *
   * This prevents Sandpack from recompiling for every partial
   * streamed file/token.
   */
  const [localPlan, setLocalPlan] = useState<Plan | null>(null);

  // History of all past completed builds (shown stacked in chat)
  type BuildSnapshot = {
    idea: string;
    plan: Plan;
    durationMs: number;
    completedAt: number;
  };
  const [activityHistory, setActivityHistory] = useState<BuildSnapshot[]>([]);

  // ───────────────────────────────────────────────────────────
  // AI GENERATION
  // ───────────────────────────────────────────────────────────

  const {
    object: plan,
    submit,
    isLoading: loading,
  } = experimental_useObject({
    api: "/api/generate-plan",

    schema: planSchema,

    onFinish: () => {
      console.log("[CodewithChat] Generation finished successfully");

      setGenError(null);
      setPreviewError(null);

      const finishedAt = Date.now();

      if (buildStartedAtRef.current) {
        const ms = finishedAt - buildStartedAtRef.current;

        setBuildDurationMs(ms);
        setBuildCompletedAt(finishedAt);

        setProjectUpdatedAt(new Date(finishedAt));

        // Snapshot this build into history BEFORE it gets replaced
        setLocalPlan((prev) => {
          if (prev) {
            setActivityHistory((h) => [
              ...h,
              {
                idea,
                plan: prev,
                durationMs: ms,
                completedAt: finishedAt,
              },
            ]);
          }
          return prev;
        });
      }

      // Intentionally not adding a "Done!" chat message here.
      // We rely on the BuildActivityFeed to show completion status and project files.
    },

    onError: (err) => {
      console.error("[CodewithChat] Generation error:", err);

      generationInFlightRef.current = false;

      const errMsg = err?.message || "Unknown error";

      setGenError(errMsg);

      if (errMsg.includes("NO_CREDITS") || errMsg.includes("402")) {
        setCredits(0);

        toast.error("Daily credits used up. Upgrade to continue building.");
      } else {
        toast.error("Failed to generate project. Please try again.");
      }

      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === "user") {
          return prev.slice(0, -1);
        }

        return prev;
      });
    },
  });

  // ───────────────────────────────────────────────────────────
  // ACTIVE PLAN
  // ───────────────────────────────────────────────────────────

  /**
   * CRITICAL PERFORMANCE FIX:
   *
   * DO NOT:
   *
   * const activePlan = plan || localPlan
   *
   * Because `plan` changes continuously while streaming.
   *
   * Sandpack should only receive a complete stable project.
   */
  const activePlan = localPlan;

  // ───────────────────────────────────────────────────────────
  // DEPENDENCIES
  // ───────────────────────────────────────────────────────────

  const activeDependencies = useMemo<Record<string, string>>(() => {
    if (!activePlan) {
      return {};
    }

    return getProjectRuntimeDependencies(
      activePlan.previewFiles,
      activePlan.dependencies ?? {},
    );
  }, [activePlan]);
  // ───────────────────────────────────────────────────────────
  // CREDITS
  // ───────────────────────────────────────────────────────────

  const refreshCredits = useCallback(() => {
    getCreditsAction().then((res) => {
      if (!res.success) return;

      setCredits(res.credits);

      window.dispatchEvent(new Event("credits-updated"));
    });
  }, []);

  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  useEffect(() => {
    if (!loading) {
      refreshCredits();
    }
  }, [loading, refreshCredits]);

  // ───────────────────────────────────────────────────────────
  // BUILD TIMER
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (loading) {
      const now = Date.now();

      buildStartedAtRef.current = now;

      setBuildStartedAt(now);
      setBuildDurationMs(null);
      setBuildCompletedAt(null);

      return;
    }

    if (buildStartedAtRef.current && !buildCompletedAt) {
      const finishedAt = Date.now();

      setBuildDurationMs(finishedAt - buildStartedAtRef.current);

      setBuildCompletedAt(finishedAt);
    }
  }, [loading, buildCompletedAt]);

  // ───────────────────────────────────────────────────────────
  // COMMIT FINISHED STREAM
  // ───────────────────────────────────────────────────────────

  /**
   * Streaming plan:
   *
   * AI tokens
   *      ↓
   * `plan` changes continuously
   *      ↓
   * Sandpack DOES NOT receive it
   *
   * Once generation finishes:
   *
   * complete plan
   *      ↓
   * validate schema
   *      ↓
   * setLocalPlan()
   *      ↓
   * Sandpack gets files ONCE
   */
  useEffect(() => {
    if (loading) {
      generationInFlightRef.current = true;

      return;
    }

    if (!generationInFlightRef.current || !plan || !projectId) {
      return;
    }

    const parsed = planSchema.safeParse(plan);

    if (!parsed.success) {
      console.error(
        "[Project] Generated plan is incomplete or invalid:",
        parsed.error,
      );

      generationInFlightRef.current = false;

      setGenError("Generated project was incomplete. Please regenerate.");

      return;
    }

    generationInFlightRef.current = false;

    const incomingFiles = parsed.data.previewFiles ?? [];
    const previewFiles = incrementalUpdateRef.current
      ? mergeGeneratedProjectFiles(
          localPlan?.previewFiles,
          incomingFiles,
          parsed.data.deletedFilePaths,
        )
      : sanitizeGeneratedProjectFiles(incomingFiles);

    incrementalUpdateRef.current = false;

    const completedPlan = {
      ...parsed.data,
      previewFiles,
    };

    /**
     * This is the ONLY point where the live preview
     * swaps to the newly generated code.
     */
    setLocalPlan(completedPlan);

    const now = new Date();

    setProjectUpdatedAt(now);

    updateProjectAction(projectId, JSON.stringify(completedPlan))
      .then((res) => {
        if (!res.success) {
          console.error("[Project] Failed to save project:", res.error);
        }
      })
      .catch((error) => {
        console.error("[Project] Error saving project:", error);
      });
  }, [loading, plan, projectId]);

  // ───────────────────────────────────────────────────────────
  // LOAD PROJECT
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!projectId) return;

    /**
     * Prevent duplicate load / duplicate first generation
     * in React Strict Mode.
     */
    if (loadedProjectRef.current === projectId) {
      return;
    }

    loadedProjectRef.current = projectId;

    console.log("[CodewithChat] Loading project:", projectId);

    setProjectLoading(true);

    getProjectByIdAction(projectId)
      .then((res) => {
        setProjectLoading(false);

        if (!res.success || !res.data) {
          console.log("[CodewithChat] Project not found or unauthorized");

          setProjectNotFound(true);

          return;
        }

        console.log(
          "[CodewithChat] Project loaded. Has code:",
          Boolean(res.data.code),
        );

        setIdea(res.data.prompt);

        setProjectTitle(res.data.title);

        setIsPinned(res.data.isPinned || false);

        if (res.data.updatedAt) {
          setProjectUpdatedAt(new Date(res.data.updatedAt));
        }

        // ─── EXISTING PROJECT ────────────────────────────

        if (res.data.code) {
          try {
            const parsed = JSON.parse(res.data.code);

            console.log(
              "[CodewithChat] Parsed saved plan. previewFiles:",
              parsed?.previewFiles?.length || 0,
            );

            /**
             * Keep backward compatibility with old saved
             * projects here.
             *
             * New generations are validated before save.
             */
            setLocalPlan({
              ...(parsed as Plan),
              previewFiles: sanitizeGeneratedProjectFiles(parsed.previewFiles),
            });

            return;
          } catch (error) {
            console.error(
              "[CodewithChat] Failed to parse project code:",
              error,
            );

            console.log(
              "[CodewithChat] Triggering regeneration due to corrupted saved code",
            );

            submit({
              idea: res.data.prompt,
              tech,
              platform,
              messages: [],
            });

            return;
          }
        }

        // ─── FIRST GENERATION ────────────────────────────

        console.log("[CodewithChat] No code saved, checking credits...");

        getCreditsAction().then((creditResult) => {
          if (!creditResult.success) {
            return;
          }

          setCredits(creditResult.credits);

          if (creditResult.credits <= 0) {
            toast.error(
              "Daily credits used up. Upgrade to generate this project.",
            );

            return;
          }

          submit({
            idea: res.data.prompt,
            tech,
            platform,
            messages: [],
          });
        });
      })
      .catch((error) => {
        console.error("[CodewithChat] Failed to load project:", error);

        setProjectLoading(false);
        setProjectNotFound(true);
      });
  }, [projectId, submit, tech, platform]);

  // ───────────────────────────────────────────────────────────
  // FOCUS RENAME INPUT
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (isRenaming && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [isRenaming]);

  // ───────────────────────────────────────────────────────────
  // CHAT ONLY
  // ───────────────────────────────────────────────────────────

  async function handleChatOnly(userMessage: string, history: ChatMessage[]) {
    setChatLoading(true);

    try {
      const response = await fetch("/api/project-chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: userMessage,
          idea,
          tech,
          platform,
          messages: history,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Chat failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error("[Project Chat] Error:", error);

      toast.error("Could not get a reply. Try again.");

      setMessages((prev) =>
        prev[prev.length - 1]?.role === "user" ? prev.slice(0, -1) : prev,
      );
    } finally {
      setChatLoading(false);
    }
  }

  // ───────────────────────────────────────────────────────────
  // SEND CHAT / CODE CHANGE
  // ───────────────────────────────────────────────────────────

  async function handleSendChat(attachedImage?: string | null) {
    if (!idea.trim()) return;

    const trimmed = chatInput.trim();

    if (isTrivialMessage(trimmed) && !attachedImage) {
      toast.error("Please ask a question or describe a real change.");

      return;
    }

    const finalMessage = attachedImage
      ? trimmed
        ? `${trimmed}\n\n[IMAGE: ${attachedImage}]`
        : `[IMAGE: ${attachedImage}]`
      : trimmed;

    const userMessage: ChatMessage = {
      role: "user",
      content: finalMessage,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setChatInput("");

    const requiresGeneration =
      Boolean(attachedImage) || shouldRegenerateCode(trimmed);

    // ─── NORMAL CHAT ─────────────────────────────────────

    if (!requiresGeneration) {
      await handleChatOnly(finalMessage, nextMessages);

      return;
    }

    // ─── CODE CHANGE ─────────────────────────────────────

    if (credits <= 0) {
      toast.error("Daily credits used up. Upgrade to continue building.");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Your daily generation credits are used up. Normal questions are still available.",
        },
      ]);

      return;
    }

    /**
     * Always modify the LAST COMPLETE project.
     *
     * Never send the partially streaming plan as
     * existingPlan.
     */
    const existingPlan = localPlan;

    incrementalUpdateRef.current = Boolean(existingPlan?.previewFiles?.length);

    submit({
      idea,
      tech,
      platform,
      messages: nextMessages,
      existingPlan,
    });
  }

  // ───────────────────────────────────────────────────────────
  // REGENERATE
  // ───────────────────────────────────────────────────────────

  function handleRegenerateProject() {
    if (!idea.trim()) return;

    if (credits <= 0) {
      toast.error("Daily credits used up. Upgrade to continue building.");

      return;
    }

    setGenError(null);
    setMessages([]);

    incrementalUpdateRef.current = false;

    submit({
      idea,
      tech,
      platform,
      messages: [],
      existingPlan: localPlan,
    });
  }

  function handleAutoFixPreview() {
    if (!idea.trim() || !localPlan || loading) return;

    if (credits <= 0) {
      toast.error("Daily credits used up. Upgrade to continue building.");
      return;
    }

    const fixRequest: ChatMessage = {
      role: "user",
      content: `Fix the generated project preview.

The preview compiler reported this error:
${previewError || "The generated project failed to compile."}

Repair the root cause in the existing project. Return the COMPLETE project
in previewFiles, preserve the existing design and features, and verify every
local import, bracket, CSS block, and dependency before finishing. Do not
return explanations instead of files.`,
    };

    const nextMessages = [...messages, fixRequest];

    setMessages(nextMessages);
    setPreviewError(null);
    setGenError(null);

    incrementalUpdateRef.current = Boolean(localPlan?.previewFiles?.length);

    submit({
      idea,
      tech,
      platform,
      messages: nextMessages,
      existingPlan: localPlan,
    });
  }

  // ───────────────────────────────────────────────────────────
  // DOWNLOAD REAL PROJECT ZIP
  // ───────────────────────────────────────────────────────────

  const handleDownloadZip = async () => {
    const projectFiles = activePlan?.previewFiles;

    if (!projectFiles?.length) {
      toast.error("No project files available to download.");

      return;
    }

    try {
      const zip = new JSZip();
      let hasTsConfigNode = false;
      let hasTsConfig = false;

      for (const file of projectFiles) {
        if (!file?.path || typeof file.content !== "string") {
          continue;
        }

        const filePath = file.path.replace(/\\/g, "/").replace(/^\/+/, "");

        if (!filePath) continue;

        if (filePath === "tsconfig.node.json") hasTsConfigNode = true;
        if (filePath === "tsconfig.json") hasTsConfig = true;

        zip.file(filePath, file.content);
      }

      if (hasTsConfig && !hasTsConfigNode) {
        zip.file(
          "tsconfig.node.json",
          `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}`,
        );
      }

      const content = await zip.generateAsync({
        type: "blob",
      });

      saveAs(content, `${projectTitle || "codewithchat-project"}.zip`);

      toast.success("Downloaded complete project ZIP!");
    } catch (error) {
      console.error("[Project] ZIP error:", error);

      toast.error("Failed to generate ZIP file.");
    }
  };

  // ───────────────────────────────────────────────────────────
  // PIN PROJECT
  // ───────────────────────────────────────────────────────────

  const handleTogglePin = async () => {
    const newValue = !isPinned;

    setIsPinned(newValue);

    const result = await togglePinProjectAction(projectId, newValue);

    if (!result.success) {
      setIsPinned(!newValue);

      toast.error("Failed to update pin.");
    }
  };

  // ───────────────────────────────────────────────────────────
  // RENAME PROJECT
  // ───────────────────────────────────────────────────────────

  const handleRename = async () => {
    const value = renameValue.trim();

    if (!value || value === projectTitle) {
      setIsRenaming(false);
      return;
    }

    const result = await renameProjectAction(projectId, value);

    if (result.success) {
      setProjectTitle(value);

      toast.success("Project renamed.");
    } else {
      toast.error("Failed to rename.");
    }

    setIsRenaming(false);
  };

  // ───────────────────────────────────────────────────────────
  // LEGACY FULLSTACK FILES
  // ───────────────────────────────────────────────────────────

  const legacyFullStackFiles = useMemo(
    () => buildFullStackFiles(activePlan?.fullStackFiles),
    [activePlan?.fullStackFiles],
  );

  // ───────────────────────────────────────────────────────────
  // BUILD PREVIEW
  // ───────────────────────────────────────────────────────────

  /**
   * New projects:
   *
   * previewFiles
   *   ↓
   * real Vite project
   *   ↓
   * buildInstantPreviewFiles()
   *   ↓
   * Sandpack runtime files
   *
   * Old projects can temporarily fall back to
   * fullStackFiles.
   */
  const previewFileMap = useMemo(() => {
    if (!activePlan) {
      return {};
    }

    return buildInstantPreviewFiles(
      activePlan.previewFiles,
      legacyFullStackFiles,
      true,
    );
  }, [activePlan, legacyFullStackFiles]);

  const previewReady = useMemo(
    () => hasPreviewEntry(previewFileMap),
    [previewFileMap],
  );

  // ───────────────────────────────────────────────────────────
  // AUTO SWITCH TO PREVIEW
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!loading && !genError && previewReady) {
      setView("preview");
      setRightPanel("preview");
    }
  }, [loading, genError, previewReady]);

  // ───────────────────────────────────────────────────────────
  // NOT FOUND
  // ───────────────────────────────────────────────────────────

  if (projectNotFound) {
    return (
      <div className="flex h-full min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted shadow-sm">
            <FileCode2 className="size-8 text-muted-foreground" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Project Not Found
          </h1>

          <p className="max-w-sm text-sm text-muted-foreground">
            This project doesn&apos;t exist or you don&apos;t have permission to
            view it.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {/* ───────────────────────────────────────────────
            TOP HEADER
        ─────────────────────────────────────────────── */}

        <div className="flex h-11 shrink-0 items-center justify-between border-b border-border/40 bg-background px-4">
          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-3">
            {/* CwC LOGO DROPDOWN */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="mr-1 flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-muted focus:outline-none"
                >
                  <span className="text-xl font-bold italic tracking-tight">
                    CwC
                  </span>
                  <ChevronDown className="size-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-56">
                {/* HOME */}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <Home className="size-3.5" />
                    <span>Home</span>
                  </Link>
                </DropdownMenuItem>

                {/* <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2"
                  >
                    <LayoutDashboard className="size-3.5" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem> */}

                <DropdownMenuSeparator />

                {/* CREDITS INDICATOR */}
                <div className="px-2 py-2">
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Coins className="size-3" />
                      <span>Daily Credits</span>
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        credits <= 0
                          ? "text-destructive"
                          : credits <= 2
                            ? "text-orange-500"
                            : "text-green-500"
                      }`}
                    >
                      {credits}/{MAX_DAILY_CREDITS}
                    </span>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        credits <= 0
                          ? "bg-destructive"
                          : credits <= 2
                            ? "bg-orange-500"
                            : "bg-green-500"
                      }`}
                      style={{
                        width: `${(credits / MAX_DAILY_CREDITS) * 100}%`,
                      }}
                    />
                  </div>

                  {credits <= 0 && (
                    <p className="mt-1.5 text-[11px] text-destructive">
                      Credits used up. Upgrade to continue.
                    </p>
                  )}
                </div>

                <DropdownMenuSeparator />

                {/* UPGRADE */}
                <DropdownMenuItem>
                  <Gift className="mr-2 size-3.5" />
                  Upgrade Plan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="mr-1 h-5 w-px shrink-0 bg-border/50" />

            {/* PROJECT NAME */}

            {isRenaming ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={renameRef}
                  value={renameValue}
                  onChange={(event) => setRenameValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleRename();
                    }

                    if (event.key === "Escape") {
                      setIsRenaming(false);
                    }
                  }}
                  className="h-7 w-40 rounded-md border border-border bg-muted/50 px-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />

                <button
                  type="button"
                  onClick={handleRename}
                  className="rounded p-1 text-green-500 hover:bg-muted"
                >
                  <Check className="size-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsRenaming(false)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <span
                className="max-w-[200px] truncate text-sm font-semibold"
                title={projectTitle}
              >
                {projectTitle || "Untitled Project"}
              </span>
            )}

            {/* PIN */}

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleTogglePin}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {isPinned ? (
                    <PinOff className="size-3.5" />
                  ) : (
                    <Pin className="size-3.5" />
                  )}
                </button>
              </TooltipTrigger>

              <TooltipContent side="bottom" className="text-xs">
                {isPinned ? "Unpin" : "Pin"} project
              </TooltipContent>
            </Tooltip>

            {/* SETTINGS */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Settings className="size-3.5" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-44 text-sm">
                <DropdownMenuItem
                  onClick={() => {
                    setRenameValue(projectTitle);

                    setIsRenaming(true);
                  }}
                >
                  <Pencil className="mr-2 size-3.5" />
                  Rename
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Settings className="mr-2 size-3.5" />
                  Project Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* RIGHT (Moved to preview toolbar) */}
        </div>

        {/* ───────────────────────────────────────────────
            MAIN
        ─────────────────────────────────────────────── */}

        <div className="flex min-h-0 flex-1">
          {/* ─────────────────────────────────────────────
              LEFT CHAT PANEL
          ───────────────────────────────────────────── */}

          <div
            className={`flex h-full shrink-0 flex-col overflow-hidden border-r border-border transition-all duration-300 ease-in-out ${
              chatPanelOpen
                ? "w-[360px] min-w-[300px] max-w-[420px] opacity-100"
                : "w-0 min-w-0 border-r-0 opacity-0"
            }`}
          >
            {/* CHAT CONTENT */}

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`max-w-[92%] whitespace-pre-wrap text-[13px] leading-relaxed ${
                      message.role === "user"
                        ? "ml-auto self-end rounded-[20px] rounded-br-sm border border-border/40 bg-muted/40 px-3.5 py-2.5 text-foreground"
                        : "w-full self-start py-1 text-foreground/90"
                    }`}
                  >
                    {message.content}
                  </div>
                ))}

                {/* PAST BUILD ACTIVITIES */}

                {activityHistory.map((hist, idx) => (
                  <div
                    key={idx}
                    className="w-full self-start py-1 text-foreground/90"
                  >
                    <BuildActivityFeed
                      plan={hist.plan}
                      loading={false}
                      idea={hist.idea}
                      startedAt={hist.completedAt - hist.durationMs}
                      durationMs={hist.durationMs}
                      completedAt={hist.completedAt}
                      fallbackUpdatedAt={new Date(hist.completedAt)}
                      compact
                      onOpenFile={handleOpenFile}
                    />
                  </div>
                ))}

                {/* CURRENT BUILD ACTIVITY */}

                {(loading ||
                  activePlan?.overview ||
                  activePlan?.steps?.length) && (
                  <div className="w-full self-start py-1 text-foreground/90">
                    <BuildActivityFeed
                      plan={activePlan ?? undefined}
                      loading={loading}
                      idea={idea}
                      startedAt={buildStartedAt}
                      durationMs={buildDurationMs}
                      completedAt={buildCompletedAt}
                      fallbackUpdatedAt={projectUpdatedAt}
                      compact
                      onOpenFile={handleOpenFile}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* CHAT INPUT */}

            <div className="shrink-0 border-t border-border bg-muted/20 p-3">
              <PromptComposer
                value={chatInput}
                onChange={setChatInput}
                onSubmit={handleSendChat}
                loading={loading || chatLoading}
                compact
                submitHint={
                  shouldRegenerateCode(chatInput) && chatInput.trim()
                    ? "Send code update"
                    : "Ask AI"
                }
                placeholder="Ask a question with CodewithChat"
              />
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              RIGHT PANEL
          ───────────────────────────────────────────── */}

          <div className="flex h-full min-w-0 flex-1 flex-col">
            {/* PROJECT LOADING */}

            {!activePlan && projectLoading && (
              <div className="flex h-full items-center justify-center">
                <Spinner className="size-8 text-primary" />
              </div>
            )}

            {/* FIRST GENERATION */}

            {!activePlan && loading && !projectLoading && (
              <div className="flex h-full animate-in flex-col items-center justify-center px-4 text-center fade-in zoom-in-95 duration-500">
                <div className="relative mb-6 flex items-center justify-center">
                  <div className="absolute size-24 rounded-full bg-primary/20 blur-2xl" />

                  <div className="relative flex items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/20 to-transparent p-5 shadow-2xl backdrop-blur-md">
                    <Gift className="size-12 text-primary" />
                  </div>
                </div>

                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  Refer & earn
                </h3>

                <p className="mb-8 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  Share CodewithChat with friends and get rewarded when they
                  subscribe
                </p>

                <Button
                  variant="outline"
                  className="mb-12 h-10 gap-2 rounded-lg border-border bg-transparent px-6 text-sm shadow-sm transition-all hover:bg-muted/50 hover:text-foreground"
                >
                  <Gift className="size-4" />
                  Earn $50
                </Button>

                <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Spinner className="size-3.5" />
                  <span className="text-foreground/80">Your</span>
                  preview will appear here
                </p>
              </div>
            )}

            {/* NO PLAN / FAILED */}

            {!activePlan && !loading && !projectLoading && (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted">
                  <Zap className="size-6 text-muted-foreground" />
                </div>

                <div>
                  <h3 className="mb-1 text-base font-semibold">
                    {genError ? "Generation Failed" : "No preview yet"}
                  </h3>

                  <p className="max-w-xs text-sm text-muted-foreground">
                    {genError
                      ? genError
                      : "Generate your project to build the live preview."}
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setGenError(null);

                    handleRegenerateProject();
                  }}
                  disabled={!idea.trim()}
                  className="gap-2"
                >
                  <Zap className="size-4" />

                  {genError ? "Retry Generation" : "Generate Project"}
                </Button>
              </div>
            )}

            {/* ───────────────────────────────────────────
                ACTIVE PROJECT
            ─────────────────────────────────────────── */}

            {activePlan && (
              <>
                {/* TOOLBAR */}

                <div className="flex h-11 shrink-0 items-center gap-1 border-b border-border bg-card/80 px-3 backdrop-blur">
                  {/* CHAT PANEL TOGGLE */}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setChatPanelOpen((open) => !open)}
                        className={`shrink-0 rounded-md p-1.5 transition-colors ${
                          chatPanelOpen
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                        aria-label={
                          chatPanelOpen ? "Hide chat panel" : "Show chat panel"
                        }
                      >
                        {chatPanelOpen ? (
                          <PanelLeftClose className="size-3.5" />
                        ) : (
                          <PanelLeftOpen className="size-3.5" />
                        )}
                      </button>
                    </TooltipTrigger>

                    <TooltipContent side="bottom" className="text-xs">
                      {chatPanelOpen
                        ? "Hide chat & activity"
                        : "Show chat & activity"}
                    </TooltipContent>
                  </Tooltip>

                  <div className="ml-1 h-5 w-px shrink-0 bg-border" />

                  {/* PREVIEW / CODE / GUIDE */}

                  <div className="flex rounded-lg border border-border/60 bg-muted/40 p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setView("preview");

                        setRightPanel("preview");
                      }}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                        view === "preview" && rightPanel === "preview"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Eye className="size-3.5" />
                      Preview
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setView("code");

                        setRightPanel("preview");
                      }}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                        view === "code" && rightPanel === "preview"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Code2 className="size-3.5" />
                      Code
                    </button>

                    <button
                      type="button"
                      onClick={() => setRightPanel("guide")}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                        rightPanel === "guide"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <BookOpen className="size-3.5" />
                      Guide
                    </button>
                  </div>

                  {/* CENTER URL */}

                  <div className="flex flex-1 justify-center items-center gap-2">
                    {rightPanel === "preview" && view === "preview" && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() =>
                                setViewportSize((prev) =>
                                  prev === "desktop"
                                    ? "tablet"
                                    : prev === "tablet"
                                      ? "mobile"
                                      : "desktop",
                                )
                              }
                              className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                            >
                              {viewportSize === "desktop" ? (
                                <Monitor className="size-4" />
                              ) : viewportSize === "tablet" ? (
                                <Tablet className="size-4" />
                              ) : (
                                <Smartphone className="size-4" />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            Toggle Viewport ({viewportSize})
                          </TooltipContent>
                        </Tooltip>

                        <div className="flex min-w-[300px] max-w-[400px] items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={handleRefreshPreview}
                                disabled={isRefreshingPreview}
                                className="text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <RotateCw
                                  className={`size-3.5 ${
                                    isRefreshingPreview ? "animate-spin" : ""
                                  }`}
                                />
                              </button>
                            </TooltipTrigger>

                            <TooltipContent side="bottom" className="text-xs">
                              Refresh preview
                            </TooltipContent>
                          </Tooltip>

                          <div className="flex-1 truncate text-center font-mono text-xs text-muted-foreground">
                            codewithchat.dev/preview/
                            {projectId.slice(0, 8)}
                            ...
                          </div>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a
                                href={`/preview/${projectId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                              >
                                <ExternalLink className="size-3.5" />
                              </a>
                            </TooltipTrigger>

                            <TooltipContent side="bottom" className="text-xs">
                              Open in new tab
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </>
                    )}
                  </div>

                  {/* ACTIONS */}

                  <div className="flex items-center gap-1.5">
                    {activePlan && (
                      <>
                        <Button
                          asChild
                          variant="secondary"
                          className="hidden h-8 rounded-md bg-muted/40 px-3 text-xs font-medium hover:bg-muted sm:flex"
                        >
                          <Link href="/pricing">Upgrade</Link>
                        </Button>

                        <ShareProjectModal projectId={projectId} />

                        <PublishProjectModal projectId={projectId} />

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            className="w-48 text-sm font-medium"
                          >
                            <DropdownMenuItem>
                              <Github className="mr-2 size-4" />
                              Connect GitHub
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                              <FileCode2 className="mr-2 size-4" />
                              Open in VS Code
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={handleDownloadZip}>
                              <Download className="mr-2 size-4" />
                              Download ZIP
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </div>

                {/* CONTENT */}

                <div className="relative min-h-0 flex-1">
                  {rightPanel === "guide" ? (
                    <ProjectGuide
                      plan={activePlan}
                      projectId={projectId}
                      idea={idea}
                      tech={tech}
                    />
                  ) : previewReady ? (
                    <SandpackPreview
                      key={previewKey}
                      files={previewFileMap}
                      dependencies={activeDependencies}
                      view={view}
                      isTerminalOpen={false}
                      onCloseTerminal={() => {}}
                      previewKey={previewKey}
                      tech={tech}
                      isLoading={loading}
                      viewportSize={viewportSize}
                      activeFile={activeFile}
                      onPreviewError={handlePreviewError}
                      onAutoFix={handleAutoFixPreview}
                    />
                  ) : loading ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#151515] text-muted-foreground">
                      <Spinner className="size-6" />

                      <p className="text-sm">Building preview…</p>

                      <p className="text-xs text-muted-foreground/70">
                        Preview will update when the complete project is ready
                      </p>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-4 bg-background px-6 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted">
                        <Eye className="size-6 text-muted-foreground" />
                      </div>

                      <div>
                        <h3 className="mb-1 text-base font-semibold">
                          Preview not ready
                        </h3>

                        <p className="max-w-sm text-sm text-muted-foreground">
                          Regenerate the project to build the live preview.
                        </p>
                      </div>

                      <Button
                        onClick={() => {
                          setGenError(null);

                          handleRegenerateProject();
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
  );
}
