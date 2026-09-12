"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  READY_SCRIPT,
  PreviewLoadingSurface,
} from "@/components/ide/preview-loading-surface";

import {
  SandpackProvider,
  SandpackCodeEditor,
  // SandpackPreview as SandpackPreviewPane,
  SandpackLayout,
  SandpackFileExplorer,
  useSandpack,
  useSandpackPreviewProgress,
  defaultDark,
} from "@codesandbox/sandpack-react";

import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

import { buildPreviewIndexHtml } from "@/lib/preview-files";

export type SandpackView = "preview" | "code";

export type ViewportSize = "desktop" | "tablet" | "mobile";

interface SandpackPreviewProps {
  files: Record<string, string>;

  dependencies?: Record<string, string>;

  view?: SandpackView;

  isTerminalOpen?: boolean;

  onCloseTerminal?: () => void;

  onPreviewError?: (message: string) => void;

  onAutoFix?: () => void;

  previewKey?: number;

  fileMode?: "preview" | "project";

  activeFile?: string | null;

  tech?: string;

  openPreviewUrl?: string;

  isLoading?: boolean;

  viewportSize?: ViewportSize;
}

// ─────────────────────────────────────────────────────────────
// PATH HELPERS
// ─────────────────────────────────────────────────────────────

function normalizePath(path: string): string {
  const normalized = path.trim().replace(/\\/g, "/").replace(/\/+/g, "/");

  if (!normalized) {
    return "/";
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function toRuntimePath(path: string): string {
  const normalized = normalizePath(path);

  if (normalized.startsWith("/src/")) {
    return normalized.slice("/src".length);
  }

  return normalized;
}

// ─────────────────────────────────────────────────────────────
// DEPENDENCIES
// ─────────────────────────────────────────────────────────────

const BLOCKED_DEPENDENCIES = new Set([
  "next",
  "vite",
  "@vitejs/plugin-react",
  "@vercel/ai",
  "@supabase/ssr",
  "@supabase/auth-helpers-nextjs",
  "typescript",
  "tailwindcss",
  "postcss",
  "autoprefixer",
]);

const KNOWN_RUNTIME_VERSIONS: Record<string, string> = {
  react: "18.2.0",

  "react-dom": "18.2.0",

  "react-router-dom": "^6.28.0",

  "lucide-react": "^0.468.0",

  clsx: "^2.1.1",

  "tailwind-merge": "^2.5.4",

  "@supabase/supabase-js": "^2.45.0",

  "framer-motion": "11.11.11",

  recharts: "^2.13.0",

  "date-fns": "^4.0.0",
};

function shouldBlockDependency(name: string): boolean {
  if (BLOCKED_DEPENDENCIES.has(name)) {
    return true;
  }

  if (
    name.startsWith("@supabase/ssr") ||
    name.startsWith("@radix-ui/") ||
    name.startsWith("@types/") ||
    name.startsWith("eslint") ||
    name.startsWith("@eslint") ||
    name.startsWith("prettier")
  ) {
    return true;
  }

  return false;
}

/**
 * Converts:
 *
 * react-router-dom/server
 * -> react-router-dom
 *
 * @supabase/supabase-js
 * -> @supabase/supabase-js
 */
function getPackageName(importSource: string): string | null {
  const source = importSource.trim();

  if (
    !source ||
    source.startsWith(".") ||
    source.startsWith("/") ||
    source.startsWith("@/") ||
    source.startsWith("http://") ||
    source.startsWith("https://") ||
    source.startsWith("data:") ||
    source.startsWith("node:")
  ) {
    return null;
  }

  if (source.startsWith("@")) {
    const parts = source.split("/");

    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }

    return source;
  }

  return source.split("/")[0] ?? null;
}

/**
 * Defensive dependency scanner.
 *
 * Even if the AI forgets to put:
 *
 * react-router-dom
 *
 * inside package.json / plan.dependencies,
 * we still detect the import from App.tsx.
 */
function discoverDependenciesFromFiles(
  files: Record<string, string>,
): Record<string, string> {
  const discovered: Record<string, string> = {};

  const addDependency = (source: string) => {
    const packageName = getPackageName(source);

    if (!packageName) {
      return;
    }

    if (shouldBlockDependency(packageName)) {
      return;
    }

    discovered[packageName] = KNOWN_RUNTIME_VERSIONS[packageName] ?? "latest";
  };

  for (const [path, content] of Object.entries(files)) {
    if (!/\.(tsx?|jsx?)$/.test(path)) {
      continue;
    }

    /**
     * Scan for `from 'package'` / `from "package"` occurrences.
     *
     * This intentionally matches only the TAIL of an import statement
     * rather than trying to match the whole line, so it works for
     * BOTH single-line and multi-line import forms:
     *
     *   import { A, B } from 'pkg'          // single-line
     *   import {\n  A,\n  B\n} from 'pkg'   // multi-line
     *   export { A } from 'pkg'             // re-export
     *
     * Local imports (`./foo`, `../bar`, `/abs`, `@/alias`) are filtered
     * out downstream by getPackageName().
     */
    const fromRegex = /\bfrom\s+['"]([^'"]+)['"]/g;

    // Side-effect imports: import 'pkg'
    const sideEffectRegex = /\bimport\s+['"]([^'"]+)['"]/g;

    // Dynamic imports: import('pkg')
    const dynamicImportRegex = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

    let match: RegExpExecArray | null;

    while ((match = fromRegex.exec(content)) !== null) {
      if (match[1]) {
        addDependency(match[1]);
      }
    }

    while ((match = sideEffectRegex.exec(content)) !== null) {
      if (match[1]) {
        addDependency(match[1]);
      }
    }

    while ((match = dynamicImportRegex.exec(content)) !== null) {
      if (match[1]) {
        addDependency(match[1]);
      }
    }
  }

  return discovered;
}

// ─────────────────────────────────────────────────────────────
// ACTIVE FILE
// ─────────────────────────────────────────────────────────────

function ActiveFileOpener({ filePath }: { filePath?: string | null }) {
  const { sandpack } = useSandpack();

  useEffect(() => {
    if (!filePath) {
      return;
    }

    const runtimePath = toRuntimePath(filePath);

    if (sandpack.files[runtimePath]) {
      sandpack.openFile(runtimePath);
    }
  }, [filePath, sandpack]);

  return null;
}

// ─────────────────────────────────────────────────────────────
// ERROR REPORTER
// ─────────────────────────────────────────────────────────────

function SandpackErrorReporter({
  onError,
}: {
  onError?: (message: string) => void;
}) {
  const { sandpack } = useSandpack();

  const lastReportedError = useRef<string | null>(null);

  const errorMessage = sandpack.error?.message ?? null;

  useEffect(() => {
    if (!errorMessage) {
      lastReportedError.current = null;

      return;
    }

    if (errorMessage === lastReportedError.current) {
      return;
    }

    lastReportedError.current = errorMessage;

    onError?.(errorMessage);
  }, [errorMessage, onError]);

  return null;
}

// ─────────────────────────────────────────────────────────────
// PREVIEW STATUS
// ─────────────────────────────────────────────────────────────

function PreviewStatusOverlay({
  isEmpty,
  onRefresh,
  onAutoFix,
}: {
  isEmpty: boolean;
  onRefresh: () => void;
  onAutoFix?: () => void;
}) {
  const { sandpack } = useSandpack();

  const progressMessage = useSandpackPreviewProgress({});

  const status = sandpack.status;

  const errorMessage = sandpack.error?.message;

  // ─── COMPILE ERROR ────────────────────────────────────

  if (errorMessage) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a0a0a]/95 p-6 backdrop-blur-sm">
        <div className="max-w-md space-y-3 text-center">
          <AlertCircle className="mx-auto size-10 text-red-400" />

          <p className="text-sm font-medium text-red-300">
            Preview failed to compile
          </p>

          <p className="max-h-40 overflow-y-auto break-words font-mono text-xs leading-relaxed text-zinc-400">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={onRefresh}
            className="mx-auto mt-3 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RefreshCw className="size-3.5" />
            Refresh Preview
          </button>

          {onAutoFix && (
            <button
              type="button"
              onClick={onAutoFix}
              className="mx-auto flex items-center gap-2 rounded-lg border border-primary/40 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              Fix with AI
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── TIMEOUT ──────────────────────────────────────────

  if (status === "timeout") {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a0a0a]/95 p-6 backdrop-blur-sm">
        <div className="max-w-md space-y-3 text-center">
          <AlertCircle className="mx-auto size-10 text-amber-400" />

          <p className="text-sm font-medium text-zinc-200">
            Preview runtime timed out
          </p>

          <p className="text-xs leading-relaxed text-zinc-400">
            Package install took too long. Large projects can take 1–3 minutes
            on first load — try again, or open preview in a new tab.
          </p>

          <button
            type="button"
            onClick={onRefresh}
            className="mx-auto flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <RefreshCw className="size-3.5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── EMPTY ────────────────────────────────────────────

  if (isEmpty) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a0a0a]/90">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <Loader2 className="size-8 animate-spin text-primary" />

          <p className="text-sm">Waiting for project files...</p>
        </div>
      </div>
    );
  }

  // ─── INITIAL / COMPILING ──────────────────────────────

  // Sandpack keeps `running` after the iframe is live. Treating it as a
  // loading state leaves a permanent overlay on top of an already-rendered
  // website, so only show the loader during the initial boot phase.
  if (status === "initial") {
    return (
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#0a0a0a]/70 backdrop-blur-[1px]">
        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-[#151515] px-4 py-2 shadow-xl">
          <Loader2 className="size-4 animate-spin text-primary" />

          <span className="text-xs text-zinc-300">
            {progressMessage ?? "Preparing preview…"}
          </span>
        </div>
      </div>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────
// FILE SAFETY
// ─────────────────────────────────────────────────────────────

function stripHugeBase64(content: string): string {
  if (!content) {
    return content;
  }

  return content.replace(
    /data:image\/[^;]+;base64,[A-Za-z0-9+/=]{1000,}/g,
    "https://placehold.co/1200x800?text=Preview+Image",
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export function SandpackPreview({
  files,

  dependencies = {},

  view = "preview",

  onPreviewError,

  onAutoFix,

  previewKey = 0,

  fileMode = "preview",

  activeFile = null,

  viewportSize = "desktop",

  isLoading = false,
}: SandpackPreviewProps) {
  const [localPreviewKey, setLocalPreviewKey] = useState(0);

  // ───────────────────────────────────────────────────────────
  // ERROR CALLBACK
  // ───────────────────────────────────────────────────────────

  const handlePreviewError = useCallback(
    (message: string) => {
      console.error("[Sandpack] Preview error:", message);

      onPreviewError?.(message);
    },
    [onPreviewError],
  );

  // ───────────────────────────────────────────────────────────
  // DISCOVER DEPENDENCIES FROM FILES
  // ───────────────────────────────────────────────────────────

  const discoveredDependencies = useMemo(
    () => discoverDependenciesFromFiles(files),
    [files],
  );

  // ───────────────────────────────────────────────────────────
  // SANITIZE PROVIDED DEPENDENCIES
  // ───────────────────────────────────────────────────────────

  const sanitizedDependencies = useMemo<Record<string, string>>(() => {
    return Object.fromEntries(
      Object.entries(dependencies).filter(
        ([name, version]) =>
          Boolean(name) &&
          typeof version === "string" &&
          Boolean(version) &&
          !shouldBlockDependency(name),
      ),
    );
  }, [dependencies]);

  // ───────────────────────────────────────────────────────────
  // FINAL RUNTIME DEPENDENCIES
  // ───────────────────────────────────────────────────────────

  const runtimeDependencies = useMemo<Record<string, string>>(() => {
    const merged: Record<string, string> = {
      ...discoveredDependencies,
      react: "18.2.0",
      "react-dom": "18.2.0",
    };

    for (const [name, version] of Object.entries(sanitizedDependencies)) {
      if (merged[name]) {
        merged[name] = version;
      }
    }

    for (const optionalPackage of [
      "lucide-react",
      "clsx",
      "tailwind-merge",
    ] as const) {
      const version =
        sanitizedDependencies[optionalPackage] ??
        discoveredDependencies[optionalPackage];

      if (version) {
        merged[optionalPackage] = version;
      }
    }

    /**
     * Always include react-router-dom at its known version
     * if ANY file in the project imports it.
     *
     * This is a belt-and-suspenders guarantee on top of the
     * discoverDependenciesFromFiles scanner — if the scanner
     * misses it, this scan of the raw string values catches it.
     */
    const routerVersion =
      sanitizedDependencies["react-router-dom"] ??
      discoveredDependencies["react-router-dom"];

    const needsReactRouter =
      routerVersion != null ||
      Object.values(files).some(
        (content) =>
          typeof content === "string" && content.includes("react-router-dom"),
      );

    if (needsReactRouter) {
      merged["react-router-dom"] = routerVersion ?? "^6.28.0";
    }

    return Object.fromEntries(
      Object.entries(merged).filter(([name]) => !shouldBlockDependency(name)),
    );
  }, [discoveredDependencies, sanitizedDependencies, files]);

  // Debug while developing
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    console.log("[Sandpack] Runtime dependencies:", runtimeDependencies);
  }, [runtimeDependencies]);

  // ───────────────────────────────────────────────────────────
  // FILES
  // ───────────────────────────────────────────────────────────

  const sandpackFiles = useMemo(() => {
    const result: Record<
      string,
      {
        code: string;
        active?: boolean;
      }
    > = {};

    for (const [rawPath, rawContent] of Object.entries(files)) {
      if (typeof rawContent !== "string") {
        continue;
      }

      const path = normalizePath(rawPath);

      if (!/\.(tsx?|jsx?|css|html)$/.test(path)) {
        continue;
      }

      result[path] = {
        code: stripHugeBase64(rawContent),
      };
    }

    // ─── ACTIVE FILE ──────────────────────────────────

    if (activeFile) {
      const runtimePath = toRuntimePath(activeFile);

      if (result[runtimePath]) {
        result[runtimePath] = {
          ...result[runtimePath],

          active: true,
        };
      }
    } else if (result["/App.tsx"]) {
      result["/App.tsx"] = {
        ...result["/App.tsx"],

        active: true,
      };
    } else if (result["/App.jsx"]) {
      result["/App.jsx"] = {
        ...result["/App.jsx"],

        active: true,
      };
    }

    // Sandpack template already has its own package.json & tsconfig.
    // If we pass the generated ones, they override Sandpack's internal config
    // and break the Vite dev server or miss dependencies we injected.
    delete result["/package.json"];
    delete result["/package-lock.json"];
    delete result["/tsconfig.json"];
    delete result["/vite.config.ts"];
    delete result["/vite.config.js"];
    delete result["/tailwind.config.js"];
    delete result["/tailwind.config.ts"];
    delete result["/postcss.config.js"];

    if (!result["/index.html"]) {
      const entry = result["/index.tsx"]
        ? "/index.tsx"
        : result["/index.jsx"]
          ? "/index.jsx"
          : result["/main.tsx"]
            ? "/main.tsx"
            : result["/main.jsx"]
              ? "/main.jsx"
              : result["/App.tsx"]
                ? "/App.tsx"
                : result["/App.jsx"]
                  ? "/App.jsx"
                  : null;

      if (entry) {
        result["/index.html"] = {
          code: buildPreviewIndexHtml(entry),
        };
      }
    }

    const html = result["/index.html"];

if (html && !html.code.includes(READY_SCRIPT)) {
  result["/index.html"] = {
    ...html,
    code: /<\/body>/i.test(html.code)
      ? html.code.replace(
          /<\/body>/i,
          () => `${READY_SCRIPT}\n</body>`,
        )
      : `${html.code}\n${READY_SCRIPT}`,
  };
}

    return result;
  }, [files, activeFile]);

  const isProjectFiles = fileMode === "project";

  const isEmpty = Object.keys(sandpackFiles).length === 0;

  // ───────────────────────────────────────────────────────────
  // REFRESH
  // ───────────────────────────────────────────────────────────

  const refreshPreview = useCallback(() => {
    setLocalPreviewKey((current) => current + 1);
  }, []);

  // ───────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#151515]">
      <SandpackProvider
        key={localPreviewKey}
        // Generated projects are real Vite projects. Using the Vite
        // template keeps the embedded preview identical to the
        // standalone /preview route and makes /index.tsx the entrypoint.
        template="vite-react-ts"
        files={sandpackFiles}
        customSetup={{
          dependencies: runtimeDependencies,
        }}
        options={{
          autorun: true,

          recompileMode: "delayed",

          recompileDelay: 250,

          bundlerTimeOut: 600000,
        }}
        theme={defaultDark}
        style={{
          flex: 1,

          display: "flex",

          flexDirection: "column",

          height: "100%",

          width: "100%",

          minHeight: 0,

          overflow: "hidden",
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .sp-wrapper,
              .sp-layout,
              .sp-stack,
              .sp-preview-container,
              .sp-preview-iframe,
              .sp-preview {
                height: 100% !important;
                min-height: 100% !important;
                width: 100% !important;
              }

              .sp-preview-actions {
                display: none !important;
              }

              .sp-wrapper,
              .sp-stack,
              .sp-preview-container {
                flex: 1 !important;
                min-height: 0 !important;
                display: flex !important;
                flex-direction: column !important;
              }

              .sp-layout {
                flex: 1 !important;
                min-height: 0 !important;
                display: flex !important;
                flex-direction: row !important;
              }

              .sp-preview-iframe {
                flex: 1 !important;
                border: 0 !important;
              }

              iframe.sp-bridge-frame {
                position: fixed !important;
                top: -10000px !important;
                left: -10000px !important;
                width: 1px !important;
                height: 1px !important;
                min-width: 0 !important;
                min-height: 0 !important;
                max-width: 1px !important;
                max-height: 1px !important;
                opacity: 0 !important;
                pointer-events: none !important;
                border: 0 !important;
              }
            `,
          }}
        />

        <ActiveFileOpener filePath={activeFile} />

        {!isProjectFiles && (
          <SandpackErrorReporter onError={handlePreviewError} />
        )}

        <div className="relative min-h-0 flex-1 overflow-visible">
          {/* ─────────────────────────────────────────────
              CODE
          ───────────────────────────────────────────── */}

          <div
            style={{
              display: view === "code" || isProjectFiles ? "flex" : "none",
            }}
            className="h-full w-full"
          >
            <SandpackLayout
              style={{
                height: "100%",

                flex: 1,

                border: "none",

                borderRadius: 0,

                gap: 0,
              }}
            >
              <SandpackFileExplorer
                style={{
                  height: "100%",

                  minWidth: "160px",

                  maxWidth: "220px",

                  fontSize: "12px",
                }}
              />

              <SandpackCodeEditor
                showTabs
                showLineNumbers
                closableTabs
                style={{
                  height: "100%",

                  flex: 1,
                }}
              />
            </SandpackLayout>
          </div>

          {/* ─────────────────────────────────────────────
              PREVIEW
          ───────────────────────────────────────────── */}

          <div
            style={{
              display: view === "preview" && !isProjectFiles ? "flex" : "none",
            }}
            className="h-full min-h-0 w-full flex-1 flex-col"
          >
            <div className="relative h-full min-h-0 w-full flex-1 overflow-auto">
              {/* <PreviewStatusOverlay
                isEmpty={isEmpty}
                onRefresh={refreshPreview}
                onAutoFix={onAutoFix}
              /> */}

              {isLoading && !isEmpty ? (
                <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex justify-center">
                  <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-[#151515]/90 px-3 py-1.5 shadow-lg backdrop-blur-sm">
                    <Loader2 className="size-3.5 animate-spin text-primary" />
                    <span className="text-xs text-zinc-300">
                      Updating preview…
                    </span>
                  </div>
                </div>
              ) : null}

              <div
                className={`h-full min-h-0 w-full overflow-auto rounded-md bg-white transition-all duration-300 ease-in-out ${
                  viewportSize === "mobile"
                    ? "mx-auto max-w-[375px] border border-zinc-800 shadow-2xl"
                    : viewportSize === "tablet"
                      ? "mx-auto max-w-[768px] border border-zinc-800 shadow-2xl"
                      : "border border-zinc-800/50"
                }`}
              >
                <SandpackLayout
                  style={{
                    height: "100%",

                    width: "100%",

                    minHeight: "100%",

                    border: "none",

                    borderRadius: 0,
                  }}
                >
                  <PreviewLoadingSurface onRetry={refreshPreview} />
                </SandpackLayout>
              </div>
            </div>
          </div>
        </div>
      </SandpackProvider>
    </div>
  );
}
