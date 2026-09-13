export const SAFE_IMAGE_PATH =
  "/src/components/common/SafeImage.tsx";

export const SAFE_IMAGE_SOURCE = `
import { useState } from "react";

export type SafeImageProps = {
  src?: string;
  fallbackSrc?: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
};

type ImageAttemptProps = {
  sources: string[];
  alt: string;
  className: string;
  loading: "lazy" | "eager";
};

function ImageAttempt({
  sources,
  alt,
  className,
  loading,
}: ImageAttemptProps) {
  const [attempt, setAttempt] = useState(0);
  const currentSource = sources[attempt];

  if (!currentSource) {
    return (
      <div
        role="img"
        aria-label={alt || "Image unavailable"}
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "8px",
          backgroundColor: "#e2e8f0",
          color: "#334155",
          overflow: "hidden",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8" cy="8" r="1.5" />
          <path d="m3 17 5-5 4 4 3-3 6 6" />
        </svg>

        <span
          style={{
            padding: "0 12px",
            textAlign: "center",
            fontSize: "12px",
            lineHeight: 1.4,
          }}
        >
          {alt || "Image unavailable"}
        </span>
      </div>
    );
  }

  return (
    <img
      key={currentSource}
      src={currentSource}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => {
        setAttempt((current) =>
          current === attempt ? current + 1 : current
        );
      }}
    />
  );
}

export function SafeImage({
  src = "",
  fallbackSrc,
  alt = "",
  className = "",
  loading = "lazy",
}: SafeImageProps) {
  const primary = src.trim();

  const fallback =
    fallbackSrc?.trim() ||
    "https://picsum.photos/seed/" +
      encodeURIComponent(alt.trim() || primary || "preview") +
      "/640/480";

  const sources = Array.from(
    new Set([primary, fallback].filter(Boolean))
  );

  return (
    <ImageAttempt
      key={JSON.stringify(sources)}
      sources={sources}
      alt={alt}
      className={className}
      loading={loading}
    />
  );
}

export default SafeImage;
`.trim();

type ProjectFile = {
  path: string;
  content: string;
};

function normalizePath(path: string): string {
  return (
    "/" +
    path
      .trim()
      .replace(/\\/g, "/")
      .replace(/\/+/g, "/")
      .replace(/^\/+/, "")
  );
}

function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function readStringMap(
  value: unknown,
  field: string,
): Record<string, string> {
  if (value === undefined) return {};

  if (!isObject(value)) {
    throw new Error(`package.json: "${field}" must be an object.`);
  }

  const result: Record<string, string> = {};

  for (const [name, entry] of Object.entries(value)) {
    if (typeof entry !== "string") {
      throw new Error(
        `package.json: "${field}.${name}" must be a string.`,
      );
    }

    result[name] = entry;
  }

  return result;
}

const APP_TSCONFIG = {
  compilerOptions: {
    target: "ES2020",
    lib: ["ES2020", "DOM", "DOM.Iterable"],
    module: "ESNext",
    moduleResolution: "Bundler",
    jsx: "react-jsx",
    strict: true,
    skipLibCheck: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    resolveJsonModule: true,
    isolatedModules: true,
    allowImportingTsExtensions: true,
    noEmit: true,
    types: ["vite/client"],
    baseUrl: ".",
    paths: {
      "@/*": ["src/*"],
    },
  },
  include: ["src"],
};

const NODE_TSCONFIG = {
  compilerOptions: {
    target: "ES2020",
    lib: ["ES2020"],
    module: "ESNext",
    moduleResolution: "Bundler",
    strict: true,
    skipLibCheck: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    resolveJsonModule: true,
    noEmit: true,
    types: ["node"],
  },
  include: [
    "vite.config.ts",
    "vite.config.mts",
    "vite.config.cts",
  ],
};

export function applyGeneratedProjectTemplates(
  files: readonly ProjectFile[],
): ProjectFile[] {
  const result = new Map<string, ProjectFile>();

  for (const file of files) {
    const path = normalizePath(file.path);

    result.set(path, {
      path,
      content: file.content,
    });
  }

  result.set(SAFE_IMAGE_PATH, {
    path: SAFE_IMAGE_PATH,
    content: SAFE_IMAGE_SOURCE,
  });

  // Apply build templates only to canonical /src frontend projects.
  const hasSourceEntry = [
    "/src/main.tsx",
    "/src/main.ts",
    "/src/main.jsx",
    "/src/main.js",
  ].some((path) => result.has(path));

  if (!hasSourceEntry) {
    return [...result.values()];
  }

  const packageFile = result.get("/package.json");

  if (!packageFile) {
    throw new Error(
      "Generated project is missing package.json.",
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(packageFile.content);
  } catch {
    throw new Error(
      "Generated package.json is invalid JSON. Repair the package manifest.",
    );
  }

  if (!isObject(parsed)) {
    throw new Error(
      "Generated package.json must contain an object.",
    );
  }

  const scripts = readStringMap(parsed.scripts, "scripts");
  const dependencies = readStringMap(
    parsed.dependencies,
    "dependencies",
  );
  const devDependencies = readStringMap(
    parsed.devDependencies,
    "devDependencies",
  );

  // Add missing packages without replacing supplied versions.
  const requiredDevDependencies: Record<string, string> = {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    typescript: "~5.6.3",
  };

  for (const [name, version] of Object.entries(
    requiredDevDependencies,
  )) {
    if (!dependencies[name] && !devDependencies[name]) {
      devDependencies[name] = version;
    }
  }

  const hasNodeConfigSource = [
    "/vite.config.ts",
    "/vite.config.mts",
    "/vite.config.cts",
  ].some((path) => result.has(path));

  // Check source types first, then build with Vite.
  scripts.build = hasNodeConfigSource
    ? "tsc --project tsconfig.json && tsc --project tsconfig.node.json && vite build"
    : "tsc --project tsconfig.json && vite build";

  scripts.dev = scripts.dev || "vite";
  scripts.preview = scripts.preview || "vite preview";

  result.set("/package.json", {
    path: "/package.json",
    content: JSON.stringify(
      {
        ...parsed,
        scripts,
        dependencies,
        devDependencies,
      },
      null,
      2,
    ),
  });

  result.set("/tsconfig.json", {
    path: "/tsconfig.json",
    content: JSON.stringify(APP_TSCONFIG, null, 2),
  });

  result.set("/tsconfig.app.json", {
    path: "/tsconfig.app.json",
    content: JSON.stringify(APP_TSCONFIG, null, 2),
  });

  result.set("/tsconfig.node.json", {
    path: "/tsconfig.node.json",
    content: JSON.stringify(NODE_TSCONFIG, null, 2),
  });

  return [...result.values()];
}