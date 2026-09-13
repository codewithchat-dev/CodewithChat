"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Download,
  ExternalLink,
  Eye,
  FileCode2,
  Home,
  Loader2,
  MessageSquare,
  Monitor,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Pin,
  PinOff,
  RotateCw,
  Smartphone,
  Sparkles,
  Tablet,
  X,
} from "lucide-react";

import { experimental_useObject } from "@ai-sdk/react";
import { z } from "zod";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { applyGeneratedProjectTemplates } from "@/lib/generated-project-templates";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ShareProjectModal } from "@/components/dashboard/share-project-modal";
import { PublishProjectModal } from "@/components/dashboard/publish-project-modal";
import { ProjectGuide } from "@/components/dashboard/project-guide";

import {
  PromptComposer,
  type ProjectType,
} from "@/components/dashboard/prompt-composer";

import {
  getProjectByIdAction,
  updateProjectAction,
  togglePinProjectAction,
  renameProjectAction,
} from "@/app/actions/projects";

import { getCreditsAction } from "@/app/actions/credits";

import {
  buildInstantPreviewFiles,
  getProjectRuntimeDependencies,
  hasPreviewEntry,
  mergeGeneratedProjectFiles,
  sanitizeGeneratedProjectFiles,
} from "@/lib/preview-files";

import { buildFullStackFiles } from "@/lib/fullstack-files";
import { planSchema } from "@/lib/schema";

import { DEFAULT_PLATFORM, DEFAULT_TECH_STACK } from "@/lib/project-structure";

import type {
  SandpackView,
  ViewportSize,
} from "@/components/ide/SandpackPreview";

// -----------------------------------------------------------------------------
// Types and helpers
// -----------------------------------------------------------------------------

type Plan = z.infer<typeof planSchema>;
type ComposerMode = "build" | "ask";
type SaveState = "idle" | "saving" | "saved" | "error";

const conversationSchema = z.array(
  z.object({
    id: z.string().optional(),
    role: z.enum(["user", "assistant"]),
    content: z.string(),
    displayContent: z.string().optional(),
    files: z.array(z.string()).optional(),
    deletedFiles: z.array(z.string()).optional(),
    failed: z.boolean().optional(),
    durationMs: z.number().nonnegative().optional(),
  }),
);

type ChatMessage = z.infer<typeof conversationSchema>[number];

type GenerationJob = {
  startedAt: number;
  basePlan: Plan | undefined;
  incremental: boolean;
};

function messageWithId(message: ChatMessage): ChatMessage {
  return {
    ...message,
    id: message.id ?? crypto.randomUUID(),
  };
}

function apiMessages(messages: ChatMessage[]) {
  return messages.map(({ role, content }) => ({
    role,
    content,
  }));
}

function displayMessage(message: ChatMessage) {
  if (message.displayContent) {
    return message.displayContent;
  }

  if (message.role === "assistant") {
    return message.content;
  }

  return (
    message.content
      .replace(/\[IMAGE:[\s\S]*?\]/g, "")
      .replace(/\n\nProject type:[\s\S]*$/, "")
      .trim() || "Use the attached image."
  );
}

function formatDuration(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));

  if (seconds < 1) return "<1s";
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return remaining ? `${minutes}m ${remaining}s` : `${minutes}m`;
}

function normalizePath(path: string) {
  return path
    .trim()
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\/+/, "");
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function Brand({ animated = false }: { animated?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src="/dark_logo.png"
        alt=""
        width={32}
        height={24}
        className={`h-6 w-8 object-contain ${
          animated ? "animate-pulse motion-reduce:animate-none" : ""
        }`}
      />

      <span className="text-xs font-semibold text-foreground">
        CodewithChat
      </span>
    </div>
  );
}

function ElapsedTime({ startedAt }: { startedAt: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const update = () => {
      setElapsed(Math.max(0, Date.now() - startedAt));
    };

    update();

    const interval = window.setInterval(update, 1000);

    return () => window.clearInterval(interval);
  }, [startedAt]);

  return <span>{formatDuration(elapsed)}</span>;
}

const SandpackPreview = dynamic(
  () =>
    import("@/components/ide/SandpackPreview").then(
      (module) => module.SandpackPreview,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center gap-3">
        <Brand animated />
        <Loader2 className="size-4 animate-spin" />
      </div>
    ),
  },
);

// -----------------------------------------------------------------------------
// Route
// -----------------------------------------------------------------------------

export default function ProjectPage() {
  const params = useParams();
  const rawId = params.id;

  const projectId = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!projectId) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  return <ProjectWorkspace key={projectId} projectId={projectId} />;
}

// -----------------------------------------------------------------------------
// Workspace
// -----------------------------------------------------------------------------

function ProjectWorkspace({ projectId }: { projectId: string }) {
  const tech = DEFAULT_TECH_STACK;
  const platform = DEFAULT_PLATFORM;

  const [projectLoading, setProjectLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [idea, setIdea] = useState("");
  const [projectTitle, setProjectTitle] = useState("Project");
  const [isPinned, setIsPinned] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);

  const [credits, setCredits] = useState<number | null>(null);

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameBusy, setRenameBusy] = useState(false);
  const renameRef = useRef<HTMLInputElement>(null);

  const [localPlan, setLocalPlan] = useState<Plan>();
  const localPlanRef = useRef<Plan | undefined>(undefined);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);

  const [chatInput, setChatInput] = useState("");
  const [composerMode, setComposerMode] = useState<ComposerMode>("build");

  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const [operationKind, setOperationKind] = useState<ComposerMode>("build");

  const [operationStartedAt, setOperationStartedAt] = useState<number | null>(
    null,
  );

  const generationJobRef = useRef<GenerationJob | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [chatPanelOpen, setChatPanelOpen] = useState(true);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const followChatRef = useRef(true);

  const [view, setView] = useState<SandpackView>("preview");
  const [rightPanel, setRightPanel] = useState<"preview" | "guide">("preview");

  const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop");

  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveAttempt, setSaveAttempt] = useState(0);

  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const saveRevisionRef = useRef(0);
  const lastSavedRef = useRef("");

  const loadedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const replaceMessages = useCallback((next: ChatMessage[]) => {
    const identified = next.map(messageWithId);

    messagesRef.current = identified;
    setMessages(identified);

    return identified;
  }, []);

  const appendMessage = useCallback((message: ChatMessage) => {
    const next = [...messagesRef.current, messageWithId(message)];

    messagesRef.current = next;
    setMessages(next);

    return next;
  }, []);

  const commitPlan = useCallback((next: Plan) => {
    localPlanRef.current = next;
    setLocalPlan(next);
  }, []);

  const refreshCredits = useCallback(async () => {
    try {
      const result = await getCreditsAction();

      if (result.success && mountedRef.current) {
        setCredits(result.credits);
        window.dispatchEvent(new Event("credits-updated"));
      }
    } catch (error) {
      console.error("[Credits]", error);
    }
  }, []);

  const finishOperation = useCallback(() => {
    busyRef.current = false;
    setBusy(false);
    setOperationStartedAt(null);
  }, []);

  const failGeneration = useCallback(
    (error: unknown) => {
      const job = generationJobRef.current;

      // Prevent duplicate reports from onError and onFinish.
      if (!job) return;

      generationJobRef.current = null;

      const message = errorMessage(error);

      setGenerationError(message);

      appendMessage({
        role: "assistant",
        content: `I couldn't apply this update. ${message}`,
        failed: true,
        durationMs: Math.max(0, Date.now() - job.startedAt),
      });

      finishOperation();
      void refreshCredits();

      toast.error(message);
    },
    [appendMessage, finishOperation, refreshCredits],
  );

  const {
    object: streamingPlan,
    submit: submitObject,
    isLoading: generationLoading,
  } = experimental_useObject({
    api: "/api/generate-plan",
    schema: planSchema,

    onError: failGeneration,

    onFinish: ({ object, error }) => {
      const job = generationJobRef.current;

      if (!job || !mountedRef.current) return;

      if (error) {
        failGeneration(error);
        return;
      }

      const parsed = planSchema.safeParse(object);

      if (!parsed.success) {
        failGeneration(
          new Error(
            "The generation response was incomplete. Your existing files were preserved.",
          ),
        );
        return;
      }

      try {
        const generated = parsed.data;
        const incomingFiles = generated.previewFiles ?? [];
        const deletedPaths = generated.deletedFilePaths ?? [];

        if (!incomingFiles.length && !deletedPaths.length) {
          failGeneration(
            new Error(
              "The generation API returned no source changes. It must return previewFiles containing the updated code.",
            ),
          );
          return;
        }

        const previousFiles = job.basePlan?.previewFiles ?? [];

        const mergedFiles = job.incremental
          ? mergeGeneratedProjectFiles(
              previousFiles,
              incomingFiles,
              deletedPaths,
            )
          : sanitizeGeneratedProjectFiles(incomingFiles);

        const nextFiles = applyGeneratedProjectTemplates(mergedFiles);

        const previousContents = new Map(
          previousFiles.map((file) => [normalizePath(file.path), file.content]),
        );

        const nextPaths = new Set(
          nextFiles.map((file) => normalizePath(file.path)),
        );

        const changedFiles = nextFiles
          .filter(
            (file) =>
              previousContents.get(normalizePath(file.path)) !== file.content,
          )
          .map((file) => file.path);

        const removedFiles = previousFiles
          .filter((file) => !nextPaths.has(normalizePath(file.path)))
          .map((file) => file.path);

        const nextPlan: Plan = {
          ...generated,
          dependencies: {
            ...(job.incremental ? (job.basePlan?.dependencies ?? {}) : {}),
            ...(generated.dependencies ?? {}),
          },
          previewFiles: nextFiles,
        };

        generationJobRef.current = null;

        commitPlan(nextPlan);
        setSaveState("saving");
        setGenerationError(null);
        setPreviewError(null);

        appendMessage({
          role: "assistant",
          content:
            changedFiles.length || removedFiles.length
              ? generated.overview || "Your project files have been updated."
              : "The returned files match the current project. No source changes were applied.",
          files: changedFiles,
          deletedFiles: removedFiles,
          durationMs: Math.max(0, Date.now() - job.startedAt),
        });

        if (!job.basePlan) {
          setView("preview");
          setRightPanel("preview");
        }

        finishOperation();
        void refreshCredits();
      } catch (error) {
        failGeneration(error);
      }
    },
  });

  const startGeneration = useCallback(
    (
      input: Parameters<typeof submitObject>[0],
      basePlan: Plan | undefined,
      incremental: boolean,
    ) => {
      if (busyRef.current) return;

      const startedAt = Date.now();

      generationJobRef.current = {
        startedAt,
        basePlan,
        incremental,
      };

      busyRef.current = true;
      followChatRef.current = true;

      setBusy(true);
      setOperationKind("build");
      setOperationStartedAt(startedAt);
      setGenerationError(null);

      try {
        submitObject(input);
      } catch (error) {
        failGeneration(error);
      }
    },
    [submitObject, failGeneration],
  );

  // ---------------------------------------------------------------------------
  // Load saved project once per workspace
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (loadedRef.current) return;

    loadedRef.current = true;

    async function loadProject() {
      try {
        const result = await getProjectByIdAction(projectId);

        if (!mountedRef.current) return;

        if (!result.success) {
          throw new Error(result.error || "Unable to load project.");
        }

        const project = result.data;

        setIdea(project.prompt);
        setProjectTitle(project.title);
        setIsPinned(Boolean(project.isPinned));

        replaceMessages([
          {
            role: "user",
            content: project.prompt,
          },
        ]);

        if (project.code) {
          const raw = JSON.parse(project.code);

          if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
            throw new Error("The saved project data is invalid.");
          }

          // Conversation is stored alongside the plan, not inside the
          // generation context's existingPlan.
          const { conversation, ...storedPlan } = raw;

          const restored = conversationSchema.safeParse(conversation);

          const restoredMessages =
            restored.success && restored.data.length
              ? restored.data
              : [
                  {
                    role: "user" as const,
                    content: project.prompt,
                  },
                  {
                    role: "assistant" as const,
                    content:
                      typeof storedPlan.overview === "string"
                        ? storedPlan.overview
                        : "Your saved project is ready.",
                    files: sanitizeGeneratedProjectFiles(
                      storedPlan.previewFiles,
                    ).map((file) => file.path),
                  },
                ];

          // Preserve compatibility with previously saved plans.
          const restoredPlan = {
            ...storedPlan,
            previewFiles: sanitizeGeneratedProjectFiles(
              storedPlan.previewFiles,
            ),
          } as Plan;

          const identified = replaceMessages(restoredMessages);

          lastSavedRef.current = JSON.stringify({
            ...restoredPlan,
            conversation: identified,
          });

          commitPlan(restoredPlan);
          setSaveState("saved");
          setProjectLoading(false);

          void refreshCredits();
          return;
        }

        const creditResult = await getCreditsAction();

        if (!mountedRef.current) return;

        setProjectLoading(false);

        if (!creditResult.success) {
          setGenerationError(
            "Unable to check credits. Please try generating again.",
          );
          return;
        }

        setCredits(creditResult.credits);

        if (creditResult.credits <= 0) {
          setGenerationError("You have no generation credits remaining.");
          return;
        }

        startGeneration(
          {
            idea: project.prompt,
            tech,
            platform,
            messages: [],
          },
          undefined,
          false,
        );
      } catch (error) {
        if (!mountedRef.current) return;

        console.error("[Project load]", error);

        setLoadError(errorMessage(error));
        setProjectLoading(false);
      }
    }

    void loadProject();
  }, [
    projectId,
    tech,
    platform,
    replaceMessages,
    commitPlan,
    refreshCredits,
    startGeneration,
  ]);

  // ---------------------------------------------------------------------------
  // Save completed project and chronological conversation
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (projectLoading || loadError || !localPlan || busy) {
      return;
    }

    const payload = JSON.stringify({
      ...localPlan,
      conversation: messages,
    });

    if (payload === lastSavedRef.current) return;

    const revision = ++saveRevisionRef.current;

    setSaveState("saving");

    saveQueueRef.current = saveQueueRef.current.then(async () => {
      try {
        const result = await updateProjectAction(projectId, payload);

        if (!result.success) {
          throw new Error(result.error || "Unable to save project.");
        }

        lastSavedRef.current = payload;

        if (mountedRef.current && revision === saveRevisionRef.current) {
          setSaveState("saved");
        }
      } catch (error) {
        console.error("[Project save]", error);

        if (mountedRef.current && revision === saveRevisionRef.current) {
          setSaveState("error");
          toast.error("Changes are not saved. Use Retry save.");
        }
      }
    });
  }, [
    projectId,
    projectLoading,
    loadError,
    localPlan,
    messages,
    busy,
    saveAttempt,
  ]);

  // Keep following incoming content unless the user scrolls upward.
  useEffect(() => {
    const viewport = chatScrollRef.current;
    const content = viewport?.firstElementChild;

    if (!viewport || !content) return;

    const observer = new ResizeObserver(() => {
      if (followChatRef.current) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    });

    observer.observe(content);

    return () => observer.disconnect();
  }, [projectLoading, loadError, chatPanelOpen]);

  useEffect(() => {
    if (isRenaming) {
      renameRef.current?.focus();
      renameRef.current?.select();
    }
  }, [isRenaming]);

  // ---------------------------------------------------------------------------
  // Build and Ask
  // ---------------------------------------------------------------------------

  async function handleSendChat(
    attachedImage?: string | null,
    projectType: ProjectType = "frontend",
  ) {
    if (busyRef.current || projectLoading || loadError) return;

    const text = chatInput.trim();

    if (!text && !attachedImage) return;

    if (composerMode === "ask" && attachedImage) {
      toast.info("Use Build mode to apply an attached image.");
      return;
    }

    if (composerMode === "build" && credits !== null && credits <= 0) {
      toast.error("You have no generation credits remaining.");
      return;
    }

    const mode = composerMode;
    let content = text;

    if (mode === "build") {
      content = [
        text || "Update the project using the attached image.",
        "",
        `Project type: ${projectType}`,
        projectType === "fullstack"
          ? "Implement the requested full-stack changes in the project files."
          : "Apply the requested interface changes. Preserve existing backend functionality unless the user asks to change it.",
        "Edit the existing project supplied in existingPlan.",
        "Return the actual updated source files in previewFiles using the required schema.",
        "For each changed file, return its complete content.",
        "Preserve unrelated files and working features.",
        "Use deletedFilePaths only for intentional file deletions.",
        "Do not replace implementation with advice or instructions for the user.",
        attachedImage ? `\n[IMAGE: ${attachedImage}]` : "",
      ]
        .filter(Boolean)
        .join("\n");
    }

    const history = appendMessage({
      role: "user",
      content,
      displayContent: text || "Use the attached image.",
    });

    setChatInput("");
    followChatRef.current = true;

    if (mode === "build") {
      const existingPlan = localPlanRef.current;

      startGeneration(
        {
          idea,
          tech,
          platform,
          messages: apiMessages(history),
          existingPlan,
        },
        existingPlan,
        Boolean(existingPlan),
      );

      return;
    }

    const startedAt = Date.now();

    busyRef.current = true;
    setBusy(true);
    setOperationKind("ask");
    setOperationStartedAt(startedAt);

    try {
      const response = await fetch("/api/project-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          idea,
          tech,
          platform,
          messages: apiMessages(history),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to get a response.");
      }

      if (typeof result.reply !== "string" || !result.reply.trim()) {
        throw new Error("The chat API returned an empty response.");
      }

      if (!mountedRef.current) return;

      appendMessage({
        role: "assistant",
        content: result.reply,
        durationMs: Math.max(0, Date.now() - startedAt),
      });
    } catch (error) {
      if (!mountedRef.current) return;

      appendMessage({
        role: "assistant",
        content: errorMessage(error),
        failed: true,
        durationMs: Math.max(0, Date.now() - startedAt),
      });

      toast.error(errorMessage(error));
    } finally {
      if (mountedRef.current) {
        finishOperation();
      }
    }
  }

  function handleRegenerateProject() {
    if (busyRef.current || !idea.trim()) return;

    if (credits !== null && credits <= 0) {
      toast.error("You have no generation credits remaining.");
      return;
    }

    appendMessage({
      role: "user",
      content: "Regenerate this project from the original request.",
    });

    startGeneration(
      {
        idea,
        tech,
        platform,
        messages: [],
        existingPlan: localPlanRef.current,
      },
      localPlanRef.current,
      false,
    );
  }

  function handleAutoFixPreview() {
    const existingPlan = localPlanRef.current;

    if (!existingPlan || !previewError || busyRef.current) return;

    if (credits !== null && credits <= 0) {
      toast.error("You have no generation credits remaining.");
      return;
    }

    const history = appendMessage({
      role: "user",
      displayContent: "Fix the preview error.",
      content: [
        "Fix this preview error in the existing project:",
        previewError,
        "",
        "Return actual corrected source files in previewFiles.",
        "Return complete content for each changed file.",
        "Preserve unrelated features, layout, and styling.",
      ].join("\n"),
    });

    startGeneration(
      {
        idea,
        tech,
        platform,
        messages: apiMessages(history),
        existingPlan,
      },
      existingPlan,
      true,
    );
  }

  // ---------------------------------------------------------------------------
  // Project controls
  // ---------------------------------------------------------------------------

  async function handleRename() {
    const title = renameValue.trim();

    if (!title || renameBusy) return;

    setRenameBusy(true);

    try {
      const result = await renameProjectAction(projectId, title);

      if (!result.success) {
        throw new Error(result.error || "Unable to rename project.");
      }

      setProjectTitle(title);
      setIsRenaming(false);
      toast.success("Project renamed.");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setRenameBusy(false);
    }
  }

  async function handleTogglePin() {
    if (pinBusy) return;

    const next = !isPinned;

    setPinBusy(true);

    try {
      const result = await togglePinProjectAction(projectId, next);

      if (!result.success) {
        throw new Error(result.error || "Unable to update pin.");
      }

      setIsPinned(next);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPinBusy(false);
    }
  }

  async function handleDownloadZip() {
    const files = localPlanRef.current?.previewFiles;

    if (!files?.length) {
      toast.error("No project files to download.");
      return;
    }

    try {
      const zip = new JSZip();

      for (const file of files) {
        const path = normalizePath(file.path);

        if (!path || path.split("/").includes("..")) {
          throw new Error("The project contains an invalid file path.");
        }

        zip.file(path, file.content);
      }

      const blob = await zip.generateAsync({ type: "blob" });

      const filename =
        projectTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "project";

      saveAs(blob, `${filename}.zip`);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  function handleOpenFile(path: string) {
    setActiveFile(path);
    setView("code");
    setRightPanel("preview");
  }

  // ---------------------------------------------------------------------------
  // Stable preview inputs
  // -----------------------------------------------------------------------------

  const activeDependencies = useMemo(
    () =>
      localPlan
        ? getProjectRuntimeDependencies(
            localPlan.previewFiles,
            localPlan.dependencies ?? {},
          )
        : {},
    [localPlan],
  );

  const legacyFullStackFiles = useMemo(
    () => buildFullStackFiles(localPlan?.fullStackFiles),
    [localPlan],
  );

  const previewFileMap = useMemo(
    () =>
      buildInstantPreviewFiles(
        localPlan?.previewFiles,
        legacyFullStackFiles,
        true,
      ),
    [localPlan, legacyFullStackFiles],
  );

  const previewReady = hasPreviewEntry(previewFileMap);

  const currentPaths = useMemo(
    () =>
      new Set(
        (localPlan?.previewFiles ?? []).map((file) => normalizePath(file.path)),
      ),
    [localPlan],
  );

  // These are received partial files, not claims that builds passed.
  const receivingFiles = useMemo(() => {
    if (!generationLoading || !generationJobRef.current) {
      return [];
    }

    const paths = new Set<string>();

    for (const file of streamingPlan?.previewFiles ?? []) {
      if (
        typeof file?.path === "string" &&
        file.path.trim() &&
        typeof file.content === "string" &&
        file.content.length > 0
      ) {
        paths.add(file.path);
      }
    }

    return [...paths];
  }, [generationLoading, streamingPlan]);

  const canPublish = Boolean(localPlan) && !busy && saveState === "saved";

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loadError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <FileCode2 className="size-9 text-muted-foreground" />

        <h1 className="text-lg font-semibold">Unable to open project</h1>

        <p className="max-w-md text-sm text-muted-foreground">{loadError}</p>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>

          <Button asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-3">
          <Link
            href="/dashboard"
            title="Dashboard"
            className="rounded-md p-2 hover:bg-muted"
          >
            <Home className="size-4" />
          </Link>

          <div className="h-5 w-px bg-border" />

          {isRenaming ? (
            <div className="flex min-w-0 items-center gap-1">
              <input
                ref={renameRef}
                value={renameValue}
                onChange={(event) => setRenameValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleRename();
                  }

                  if (event.key === "Escape") {
                    setIsRenaming(false);
                  }
                }}
                className="h-8 min-w-0 rounded-md border border-border bg-muted px-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              />

              <Button
                size="icon"
                variant="ghost"
                onClick={handleRename}
                disabled={renameBusy}
                aria-label="Save title"
              >
                <Check className="size-4" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsRenaming(false)}
                aria-label="Cancel rename"
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setRenameValue(projectTitle);
                setIsRenaming(true);
              }}
              className="flex min-w-0 items-center gap-2 text-sm font-medium"
            >
              <span className="max-w-64 truncate">{projectTitle}</span>
              <Pencil className="size-3 text-muted-foreground" />
            </button>
          )}

          <button
            type="button"
            onClick={handleTogglePin}
            disabled={pinBusy}
            title={isPinned ? "Unpin project" : "Pin project"}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            {isPinned ? (
              <PinOff className="size-4" />
            ) : (
              <Pin className="size-4" />
            )}
          </button>

          <div className="ml-auto flex items-center gap-3">
            {credits !== null && (
              <span className="hidden text-xs text-muted-foreground sm:block">
                {credits} credits
              </span>
            )}

            <Link href="/pricing" className="text-xs font-medium text-primary">
              Upgrade
            </Link>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {chatPanelOpen && (
            <aside className="flex h-full w-[360px] max-w-[85vw] shrink-0 flex-col border-r border-border">
              <div
                ref={chatScrollRef}
                onScroll={(event) => {
                  const element = event.currentTarget;

                  followChatRef.current =
                    element.scrollHeight -
                      element.scrollTop -
                      element.clientHeight <
                    80;
                }}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5"
              >
                <div className="flex min-w-0 flex-col gap-7">
                  {messages.map((message) => (
                    <article
                      key={message.id}
                      className={
                        message.role === "user"
                          ? "ml-6 min-w-0 self-end rounded-2xl bg-muted/60 px-4 py-3"
                          : "min-w-0"
                      }
                    >
                      {message.role === "assistant" && (
                        <div className="mb-3">
                          <Brand />
                        </div>
                      )}

                      <p
                        className={`whitespace-pre-wrap break-words text-[13px] leading-6 ${
                          message.failed ? "text-red-400" : "text-foreground/90"
                        }`}
                      >
                        {displayMessage(message)}
                      </p>

                      {message.files !== undefined && (
                        <details open className="group mt-3 min-w-0">
                          <summary className="flex cursor-pointer list-none items-center gap-2 py-2 text-xs text-muted-foreground [&::-webkit-details-marker]:hidden">
                            <Check className="size-3.5 shrink-0 text-emerald-500" />

                            <span>
                              {message.files.length} files changed
                              {message.deletedFiles?.length
                                ? ` · ${message.deletedFiles.length} removed`
                                : ""}
                            </span>

                            <ChevronDown className="ml-auto size-3.5 transition-transform group-open:rotate-180" />
                          </summary>

                          <div className="space-y-1 border-l border-border/60 pl-3">
                            {message.files.map((path) => {
                              const exists = currentPaths.has(
                                normalizePath(path),
                              );

                              return (
                                <button
                                  key={path}
                                  type="button"
                                  disabled={!exists}
                                  onClick={() => handleOpenFile(path)}
                                  title={
                                    exists
                                      ? "Open current file version"
                                      : "This file is no longer in the project"
                                  }
                                  className="flex w-full min-w-0 items-start gap-2 rounded-md px-2 py-2 text-left hover:bg-muted/50 disabled:opacity-40"
                                >
                                  <FileCode2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                  <span className="min-w-0 break-all font-mono text-xs leading-5">
                                    {path}
                                  </span>
                                </button>
                              );
                            })}

                            {message.deletedFiles?.map((path) => (
                              <p
                                key={path}
                                className="break-all px-2 py-2 font-mono text-xs text-muted-foreground"
                              >
                                Removed: {path}
                              </p>
                            ))}
                          </div>
                        </details>
                      )}

                      {message.role === "assistant" &&
                        message.durationMs !== undefined && (
                          <p className="mt-3 text-[11px] text-muted-foreground">
                            {message.failed ? "Stopped after" : "Finished in"}{" "}
                            {formatDuration(message.durationMs)}
                          </p>
                        )}
                    </article>
                  ))}

                  {busy && (
                    <article className="min-w-0">
                      <Brand animated />

                      <div
                        role="status"
                        className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <Loader2 className="size-3.5 shrink-0 animate-spin" />

                        <span>
                          {operationKind === "ask"
                            ? "Preparing response…"
                            : localPlan
                              ? "Generating your changes…"
                              : "Generating your project…"}
                        </span>
                      </div>

                      {operationKind === "build" &&
                        receivingFiles.length > 0 && (
                          <div className="mt-4 space-y-2 border-l border-border/60 pl-3">
                            <p className="pb-1 text-[11px] text-muted-foreground">
                              Receiving source files
                            </p>

                            {receivingFiles.map((path) => (
                              <div
                                key={path}
                                className="flex min-w-0 items-start gap-2 py-1"
                              >
                                <FileCode2 className="mt-0.5 size-4 shrink-0 text-primary" />

                                <span className="min-w-0 break-all font-mono text-xs leading-5">
                                  {path}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                      {operationStartedAt !== null && (
                        <p className="mt-3 text-[11px] text-muted-foreground">
                          Working for{" "}
                          <ElapsedTime startedAt={operationStartedAt} />
                        </p>
                      )}
                    </article>
                  )}
                </div>
              </div>

              <div className="shrink-0 border-t border-border bg-muted/10 p-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex rounded-lg bg-muted/60 p-1">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setComposerMode("build")}
                      aria-pressed={composerMode === "build"}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors ${
                        composerMode === "build"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Sparkles className="size-3.5" />
                      Build
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setComposerMode("ask")}
                      aria-pressed={composerMode === "ask"}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors ${
                        composerMode === "ask"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground"
                      }`}
                    >
                      <MessageSquare className="size-3.5" />
                      Ask
                    </button>
                  </div>

                  <div
                    role="status"
                    className="text-[11px] text-muted-foreground"
                  >
                    {saveState === "saving" && "Saving…"}
                    {saveState === "saved" && "Saved"}

                    {saveState === "error" && (
                      <button
                        type="button"
                        onClick={() => setSaveAttempt((value) => value + 1)}
                        className="text-red-400 underline underline-offset-2"
                      >
                        Retry save
                      </button>
                    )}
                  </div>
                </div>

                <PromptComposer
                  value={chatInput}
                  onChange={setChatInput}
                  onSubmit={handleSendChat}
                  loading={busy || projectLoading}
                  compact
                  submitHint={
                    composerMode === "build"
                      ? "Apply code changes"
                      : "Ask a question"
                  }
                  placeholder={
                    composerMode === "build"
                      ? "Describe what you want to change…"
                      : "Ask about your project…"
                  }
                />
              </div>
            </aside>
          )}

          <section className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex min-h-11 shrink-0 flex-wrap items-center gap-2 border-b border-border px-3 py-1.5">
              <button
                type="button"
                onClick={() => setChatPanelOpen((open) => !open)}
                title={chatPanelOpen ? "Hide chat" : "Show chat"}
                className="rounded-md p-1.5 hover:bg-muted"
              >
                {chatPanelOpen ? (
                  <PanelLeftClose className="size-4" />
                ) : (
                  <PanelLeftOpen className="size-4" />
                )}
              </button>

              <div className="flex rounded-lg bg-muted/50 p-0.5">
                {[
                  { id: "preview", label: "Preview", Icon: Eye },
                  { id: "code", label: "Code", Icon: Code2 },
                  { id: "guide", label: "Guide", Icon: BookOpen },
                ].map(({ id, label, Icon }) => {
                  const selected =
                    id === "guide"
                      ? rightPanel === "guide"
                      : rightPanel === "preview" && view === id;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        if (id === "guide") {
                          setRightPanel("guide");
                        } else {
                          setRightPanel("preview");
                          setView(id as SandpackView);
                        }
                      }}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs ${
                        selected
                          ? "bg-background shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-3.5" />
                      {label}
                    </button>
                  );
                })}
              </div>

              {localPlan && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setViewportSize((current) =>
                        current === "desktop"
                          ? "tablet"
                          : current === "tablet"
                            ? "mobile"
                            : "desktop",
                      )
                    }
                    title={`Viewport: ${viewportSize}`}
                    className="rounded-md p-1.5 hover:bg-muted"
                  >
                    {viewportSize === "desktop" ? (
                      <Monitor className="size-4" />
                    ) : viewportSize === "tablet" ? (
                      <Tablet className="size-4" />
                    ) : (
                      <Smartphone className="size-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPreviewError(null);
                      setPreviewKey((key) => key + 1);
                    }}
                    title="Restart preview"
                    className="rounded-md p-1.5 hover:bg-muted"
                  >
                    <RotateCw className="size-4" />
                  </button>

                  <a
                    href={`/preview/${projectId}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Open saved preview"
                    className="rounded-md p-1.5 hover:bg-muted"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </>
              )}

              <div className="ml-auto flex items-center gap-1">
                {localPlan && (
                  <>
                    <ShareProjectModal projectId={projectId} />

                    {canPublish ? (
                      <PublishProjectModal projectId={projectId} />
                    ) : (
                      <Button
                        size="sm"
                        disabled
                        className="h-8 text-xs"
                        title="Wait until changes are saved"
                      >
                        Publish
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          aria-label="Project actions"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleDownloadZip}>
                          <Download className="mr-2 size-4" />
                          Download ZIP
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          disabled={busy}
                          onClick={handleRegenerateProject}
                        >
                          <RotateCw className="mr-2 size-4" />
                          Regenerate project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>

            <div className="relative min-h-0 flex-1">
              {projectLoading ? (
                <div className="flex h-full items-center justify-center gap-3">
                  <Brand animated />
                  <Loader2 className="size-4 animate-spin" />
                </div>
             ) : localPlan ? (
  <div className="relative h-full min-h-0 w-full">
    {/* Keep Sandpack mounted while the Guide is visible. */}
    <div
      aria-hidden={rightPanel === "guide"}
      className="absolute inset-0"
      style={{
        visibility:
          rightPanel === "guide" ? "hidden" : "visible",
        pointerEvents:
          rightPanel === "guide" ? "none" : "auto",
      }}
    >
      {previewReady ? (
        <SandpackPreview
          key={previewKey}
          files={previewFileMap}
          dependencies={activeDependencies}
          view={view}
          isTerminalOpen={false}
          onCloseTerminal={() => {}}
          previewKey={previewKey}
          tech={tech}
          isLoading={busy && operationKind === "build"}
          viewportSize={viewportSize}
          activeFile={activeFile}
          onPreviewError={setPreviewError}
          onAutoFix={handleAutoFixPreview}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
          <FileCode2 className="size-8 text-muted-foreground" />

          <p className="text-sm">
            Project files are saved, but no preview entry was found.
          </p>

          <Button
            disabled={busy}
            onClick={handleRegenerateProject}
          >
            Regenerate project
          </Button>
        </div>
      )}
    </div>

    {rightPanel === "guide" && (
      <div className="absolute inset-0 overflow-auto bg-background">
        <ProjectGuide
          plan={localPlan}
          projectId={projectId}
          idea={idea}
          tech={tech}
        />
      </div>
    )}
  </div>
) : busy ? (
                <div className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center">
                  <img
                    src="/dark_logo.png"
                    alt="CodewithChat"
                    width={100}
                    height={72}
                    className="h-18 w-25 animate-pulse object-contain motion-reduce:animate-none"
                  />

                  <p className="text-sm text-muted-foreground">
                    Your preview will appear when the project is ready.
                  </p>

                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                  <Brand />

                  <p className="max-w-md text-sm text-muted-foreground">
                    {generationError || "Your project is ready to generate."}
                  </p>

                  <Button
                    onClick={handleRegenerateProject}
                    disabled={!idea.trim()}
                  >
                    {generationError ? "Retry generation" : "Generate project"}
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </TooltipProvider>
  );
}
