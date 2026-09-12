"use client";

import { useMemo, useState } from "react";

import {
  SandpackProvider,
  defaultDark,
} from "@codesandbox/sandpack-react";

import {
  READY_SCRIPT,
  PreviewLoadingSurface,
} from "@/components/ide/preview-loading-surface";

import {
  getProjectRuntimeDependencies,
  buildPreviewIndexHtml,
} from "@/lib/preview-files";

type PreviewClientProps = {
  files: Record<string, string>;
  dependencies?: Record<string, string>;
};

const EMPTY_DEPENDENCIES: Record<string, string> = {};

export function PreviewClient({
  files,
  dependencies = EMPTY_DEPENDENCIES,
}: PreviewClientProps) {
  const [attempt, setAttempt] = useState(0);

  const runtimeDependencies = useMemo<Record<string, string>>(() => {
    const previewFileInputs = Object.entries(files).map(
      ([path, content]) => ({
        path,
        content,
      }),
    );

    const merged = getProjectRuntimeDependencies(
      previewFileInputs,
      dependencies,
    );

    const needsRouter =
      Boolean(merged["react-router-dom"]) ||
      Object.values(files).some((content) =>
        content.includes("react-router-dom"),
      );

    return {
      ...merged,
      react: "18.2.0",
      "react-dom": "18.2.0",
      ...(needsRouter
        ? {
            "react-router-dom":
              merged["react-router-dom"] ?? "^6.28.0",
          }
        : {}),
    };
  }, [files, dependencies]);

  const sandpackFiles = useMemo(() => {
    const result: Record<string, { code: string }> = {};

    for (const [rawPath, content] of Object.entries(files)) {
      const normalized = rawPath.trim().replace(/\\/g, "/");
      const path = normalized.startsWith("/")
        ? normalized
        : `/${normalized}`;

      result[path] = { code: content };
    }

    // Retain the existing preview configuration strategy.
    for (const path of [
      "/package.json",
      "/package-lock.json",
      "/tsconfig.json",
      "/vite.config.ts",
      "/vite.config.js",
      "/tailwind.config.js",
      "/tailwind.config.ts",
      "/postcss.config.js",
    ]) {
      delete result[path];
    }

    if (!result["/index.html"]) {
      const entry = [
        "/index.tsx",
        "/index.jsx",
        "/main.tsx",
        "/main.jsx",
        "/src/main.tsx",
        "/src/main.jsx",
      ].find((path) => Boolean(result[path]));

      if (entry) {
        result["/index.html"] = {
          code: buildPreviewIndexHtml(entry),
        };
      }
    }

    const html = result["/index.html"];

    // Add the readiness reporter once to the preview HTML.
    if (html && !html.code.includes(READY_SCRIPT)) {
      result["/index.html"] = {
        code: /<\/body>/i.test(html.code)
          ? html.code.replace(
              /<\/body>/i,
              () => `${READY_SCRIPT}\n</body>`,
            )
          : `${html.code}\n${READY_SCRIPT}`,
      };
    }

    return result;
  }, [files]);

  return (
    <main className="cwc-browser-preview h-dvh w-full overflow-hidden bg-[#101114]">
      <SandpackProvider
        key={attempt}
        template="vite-react-ts"
        files={sandpackFiles}
        customSetup={{
          dependencies: runtimeDependencies,
        }}
        options={{
          autorun: true,
          recompileMode: "delayed",
          recompileDelay: 250,
          bundlerTimeOut: 180000,
        }}
        theme={defaultDark}
        style={{
          height: "100%",
          width: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <style>{`
          .cwc-browser-preview .sp-wrapper,
          .cwc-browser-preview .sp-layout,
          .cwc-browser-preview .sp-stack,
          .cwc-browser-preview .sp-preview-container,
          .cwc-browser-preview .sp-preview {
            width: 100% !important;
            height: 100% !important;
            min-height: 0 !important;
          }

          .cwc-browser-preview .sp-wrapper,
          .cwc-browser-preview .sp-stack,
          .cwc-browser-preview .sp-preview-container {
            display: flex !important;
            flex-direction: column !important;
            flex: 1 !important;
          }

          .cwc-browser-preview iframe.sp-preview-iframe {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            min-height: 0 !important;
            flex: 1 !important;
            border: 0 !important;
            pointer-events: auto !important;
          }

          .cwc-browser-preview .sp-preview-actions {
            display: none !important;
          }

          .cwc-browser-preview iframe.sp-bridge-frame {
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
        `}</style>

        <PreviewLoadingSurface
          onRetry={() => setAttempt((current) => current + 1)}
        />
      </SandpackProvider>
    </main>
  );
}