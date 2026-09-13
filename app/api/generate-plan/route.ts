import { google } from "@ai-sdk/google";
import { auth, currentUser } from "@clerk/nextjs/server";
import { streamObject, type ModelMessage } from "ai";

import { planSchema } from "@/lib/schema";
import { db } from "@/lib/db";
import { MAX_DAILY_CREDITS } from "@/lib/credits";
import {
  SAFE_IMAGE_PATH,
  SAFE_IMAGE_SOURCE,
} from "@/lib/generated-project-templates";

export const maxDuration = 300;

type UserModelMessage = Extract<ModelMessage, { role: "user" }>;
type UserMessageContent = UserModelMessage["content"];

// ─────────────────────────────────────────────────────────────
// DAILY CREDIT SYSTEM
// ─────────────────────────────────────────────────────────────

function isDifferentUtcDay(
  lastReset: Date | null | undefined,
  now: Date,
): boolean {
  if (!lastReset) return true;

  return (
    lastReset.getUTCFullYear() !== now.getUTCFullYear() ||
    lastReset.getUTCMonth() !== now.getUTCMonth() ||
    lastReset.getUTCDate() !== now.getUTCDate()
  );
}

async function consumeGenerationCredit() {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false as const,
      status: 401,
      error: "Unauthorized",
      credits: 0,
    };
  }

  const now = new Date();

  let dbUser = await db.user.findUnique({
    where: {
      clerkId: userId,
    },
  });

  // First time user
  if (!dbUser) {
    const clerkUser = await currentUser();

    dbUser = await db.user.create({
      data: {
        clerkId: userId,
        email:
          clerkUser?.emailAddresses?.[0]?.emailAddress ??
          `${userId}@placeholder.local`,
        credits: MAX_DAILY_CREDITS,
        lastCreditResetAt: now,
      },
    });
  }

  // Reset credits when a new UTC calendar day starts
  if (isDifferentUtcDay(dbUser.lastCreditResetAt, now)) {
    dbUser = await db.user.update({
      where: {
        id: dbUser.id,
      },
      data: {
        credits: MAX_DAILY_CREDITS,
        lastCreditResetAt: now,
      },
    });
  }

  // Daily limit reached
  if (dbUser.credits <= 0) {
    return {
      ok: false as const,
      status: 402,
      error: "NO_CREDITS",
      credits: 0,
    };
  }

  // Consume 1 credit
  const updatedUser = await db.user.update({
    where: {
      id: dbUser.id,
    },
    data: {
      credits: {
        decrement: 1,
      },
    },
  });

  return {
    ok: true as const,
    credits: updatedUser.credits,
  };
}

// ─────────────────────────────────────────────────────────────
// IMAGE MESSAGE PARSER
// ─────────────────────────────────────────────────────────────

function parseMessageContent(content: string): UserMessageContent {
  if (typeof content !== "string" || !content.includes("[IMAGE: data:image/")) {
    return content;
  }

  const startIndex = content.indexOf("[IMAGE: ");

  if (startIndex === -1) {
    return content;
  }

  const textPart = content.substring(0, startIndex).trim();

  const imagePartWithBracket = content.substring(startIndex + 8);

  const endIndex = imagePartWithBracket.indexOf("]");

  if (endIndex === -1) {
    return content;
  }

  const imagePart = imagePartWithBracket.substring(0, endIndex).trim();

  const base64Data = imagePart.includes(",")
    ? imagePart.split(",")[1]
    : imagePart;

  if (!base64Data) {
    return textPart;
  }

  return [
    ...(textPart
      ? [
          {
            type: "text" as const,
            text: textPart,
          },
        ]
      : []),
    {
      type: "image" as const,
      image: base64Data,
    },
  ] as UserMessageContent;
}

// ─────────────────────────────────────────────────────────────
// GENERATION SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────

function getSystemPrompt({
  tech,
  platform,
  isUpdate = false,
}: {
  tech?: string;
  platform?: string;
  isUpdate?: boolean;
}) {
  return `
You are CodewithChat's frontend application generator.

Return an implementation matching the supplied schema.
Your output is source code for a working application, not advice.

MODE
${isUpdate ? `
EDIT AN EXISTING PROJECT:
- Read the current source files and the latest user request.
- Change only the files required to implement that request.
- previewFiles must contain only changed or added files.
- Return complete content for each changed file.
- Omit unchanged files; the host merges them back.
- Use deletedFilePaths only for intentional deletions.
- Preserve existing paths, exports, routes, data, and working features.
- Base-file requirements below apply only when a required file is missing
  or must change for the requested feature.
- Do not replace the project with a generic new design.
` : `
CREATE A NEW PROJECT:
- Return the complete runnable project in previewFiles.
- Implement the actual requested product experience.
- Include all required source, CSS, and configuration files.
`}

SUPPORTED SCOPE
- Frontend applications only.
- React 18, Vite, TypeScript, Tailwind CSS 3.4.
- Use lucide-react for icons.
- Use react-router-dom 6 when multiple routes are needed.
- Use local mock data and React state.
- Use localStorage only for appropriate demo persistence.
- Do not generate Supabase, server code, credentials, or auth gates.
- If the request includes backend features, describe the result honestly
  as a frontend demo. Do not claim real payments, authentication,
  database persistence, email delivery, or streaming services exist.

Requested stack label: ${tech || "React + Vite"}
Platform: ${platform || "Website"}

SOURCE CONTRACT
- previewFiles contains the real downloadable project.
- fullStackFiles must be [].
- Every file must contain complete, readable source.
- Use real newlines and indentation.
- Do not emit Markdown fences or Markdown links inside source files.
- No empty files, placeholder exports, or incomplete JSX.
- Never render source code or configuration text in the interface.
- Use JSX comments, not raw // comments between JSX elements.
- Every local import must resolve to an included or existing file.
- Prefer relative imports unless aliases are fully configured.
- Do not use Next.js imports or next/image.

NEW PROJECT BASE FILES
/package.json
/.gitignore
/index.html
/vite.config.ts
/tsconfig.json
/tsconfig.app.json
/tsconfig.node.json
/tailwind.config.js
/postcss.config.js
/src/main.tsx
/src/App.tsx
/src/index.css

- index.html must mount #root and load /src/main.tsx.
- main.tsx must import index.css and mount App with createRoot.
- TypeScript project references must point to real config files.
- package.json scripts:
  dev: vite
  build: tsc -b && vite build
  preview: vite preview
- Include React and React DOM type packages for TypeScript.
- If package.json uses type: module, .js config files must use ESM exports.

DEPENDENCIES
- React and react-dom: 18.2.0.
- Tailwind CSS: 3.4.17.
- Use compatible Vite, TypeScript, PostCSS, autoprefixer,
  and @vitejs/plugin-react development dependencies.
- Use react-router-dom ^6.28.0 if routing is required.
- Runtime dependencies must include everything imported by source code.
- Top-level dependencies contains runtime packages only.
- Build tools belong in package.json devDependencies only.
- Do not use extra UI kits, Radix, or framer-motion.

TAILWIND COMPATIBILITY
- Use Tailwind 3 syntax consistently.
- tailwind.config.js must include:
  darkMode: "class"
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
- index.css must include:
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
- Do not generate Tailwind 4 @theme or @custom-variant directives.
- Do not use dynamically assembled utility names like bg-\${color}-500.
- Use complete literal class names.
- For essential theme colors, use ordinary CSS variables and CSS rules.
  The page must not depend exclusively on custom Tailwind color names.
- Do not put browser Tailwind CDN scripts into the downloadable project.
  Its production CSS must be built through PostCSS.

DESIGN FIDELITY
- Follow an attached reference image when one is supplied.
- Match its layout, density, hierarchy, spacing, and color relationships.
- Do not claim pixel-perfect fidelity without a reference and visual checks.
- Without a reference, use recognizable product-specific patterns.
- Do not turn every application into a giant marketing hero.
- Do not apply glassmorphism, huge headings, gradients, or hover scaling
  everywhere. Use them only when appropriate.
- Choose file count and component size based on the implementation.
  Do not inflate line counts or create files to satisfy a quota.

GROCERY / BLINKIT-STYLE REQUESTS
- Use a compact grocery storefront, not a full-screen generic hero.
- Use a light default theme with a yellow/green brand palette.
- Include a compact delivery/location header, prominent search,
  category grid, product sections, and cart.
- Use grocery imagery, visible prices, quantity/unit labels,
  and working Add/quantity controls.
- Use a short promotional banner with readable text and relevant imagery.
- Product images should usually use object-contain on a light surface.
- Category and product cards must not become empty dark gradient blocks.
- Search filters the local catalog.
- Category selection filters or navigates to matching products.
- Cart quantity, subtotal, and empty state must update correctly.
- Do not show a successful payment or order submission as real commerce.

OTHER PRODUCT PATTERNS
- Spotify-style: sidebar, search/library, album artwork, bottom player.
  Do not claim audio playback if no playable audio source exists.
- Netflix-style: cinematic featured content and horizontal media rows.
  Use properly sized cards with shrink-0; do not collapse posters.
- Dashboards: readable navigation, metrics, tables, filters, useful states.
- Marketing sites: appropriate sections, strong hierarchy, concise copy.
- Preserve the user's requested theme and design rather than forcing
  all products into one light or dark template.

COLOR AND CONTRAST
Define ordinary CSS variables in /src/index.css:
--app-bg
--app-surface
--app-surface-muted
--app-text
--app-muted
--app-border
--app-accent
--app-on-accent

- Give every text/background pair intentional readable colors.
- Normal text should target at least 4.5:1 contrast.
- Large text and meaningful UI graphics should target at least 3:1.
- Do not claim measured compliance unless measurement actually happened.
- Never place black text on dark badges or white text on pale surfaces.
- Inputs need explicit background, text, border, and placeholder colors.
- Primary buttons need an explicit contrasting foreground color.
- Icons normally inherit currentColor from a readable parent.
- Avoid setting opacity on entire containers containing readable text.
- Hero text must remain readable even when the image fails.
- Use an appropriate solid background or overlay behind hero text.
- Test the visual consistency of the navbar, sidebar, cards, footer,
  menus, dialogs, inputs, and buttons in every supported theme.

WORKING LIGHT / DARK TOGGLE
Only add a theme toggle when requested or already present.

When a toggle is required:
1. Create one shared ThemeProvider and useTheme hook.
2. Wrap the entire application in that provider.
3. Store the active theme as "light" or "dark".
4. Update the iframe application's own document.documentElement:
   toggle the "dark" class and set style.colorScheme.
5. Define :root and :root.dark versions of the CSS variables.
6. Use those variables across all major surfaces and text.
7. Persist the choice with localStorage using try/catch.
8. Restore a valid saved preference on initial load.
9. The toggle must change real colors, not only its icon.
10. Provide an accessible button label and type="button".
11. Do not modify window.parent.document.
12. Do not create multiple independent theme contexts.
13. A fixed bg-white or text-black must have an appropriate dark-mode
    counterpart unless that surface intentionally remains light.
14. Use a product-appropriate initial theme when no preference exists.

IMAGES
- Use relevant image assets supplied in the request whenever possible.
- Preserve working image URLs from the existing project during edits.
- Use plain HTTPS URLs, never Markdown-formatted URLs.
- Never invent an Unsplash photo ID and describe it as verified.
- Do not claim to have searched or checked URLs without tools.
- Avoid a random unrelated photo as a grocery product image.
- Prefer supplied assets; otherwise use a suitable known photo source
  with a resilient fallback.
- If no suitable photo is available, render a clear category-specific
  illustration with a visible label instead of an empty rectangle.
- Give image containers explicit dimensions or aspect ratios.
- Use object-contain for isolated products and object-cover for banners.
- Load the main above-the-fold hero image eagerly.
- Lazy-load below-the-fold images.

STANDARD IMAGE COMPONENT

CodewithChat supplies this component at:
${SAFE_IMAGE_PATH}

The host inserts this exact implementation after generation.
Treat this path as a reserved platform component.

Component source:
${SAFE_IMAGE_SOURCE}

Rules:
- Import and use this SafeImage component for remote content images.
- Use the correct relative import for the file's location.
- For /src/components/Navbar.tsx:
  import SafeImage from "./common/SafeImage";
- For /src/pages/HomePage.tsx:
  import SafeImage from "../components/common/SafeImage";
- Do not create another competing SafeImage implementation.
- Do not modify or delete the reserved component.
- Do not pass unsupported props.
- Supported props: src, fallbackSrc, alt, className, loading.
- Use loading="eager" for an above-the-fold hero.
- Give every image explicit dimensions or an aspect ratio.
- Use the correct data field, such as src={category.image}.
- The automatic dummy fallback is a generic photograph.
- For category-specific imagery, provide a relevant primary or fallback URL.
- Do not claim image URLs are verified unless they were actually checked.
- Use a positioned SafeImage for photographic hero backgrounds
  instead of an unhandled remote CSS background-image.
- For image-fix requests, update existing image usage to this component.

FUNCTIONALITY
- Every visible control must have a meaningful implemented action.
- Search must filter data.
- Tabs must switch content.
- Navigation must open real routes or sections.
- Mobile menus must open and close.
- Forms must validate input and accurately describe demo behavior.
- Dialogs must have a close action.
- Cart operations must update state consistently.
- Disabled/upcoming actions must be clearly marked.
- Use buttons for actions and links for navigation.
- Respect reduced-motion preferences.
- Do not add nonfunctional controls just to make the UI look complete.

EDIT INTEGRITY
- A theme fix may require CSS, provider, navbar, and affected components.
  Include every file necessary to complete that fix.
- An image fix must update data URLs and fallback behavior as needed.
- Preserve existing working data and routes.
- Do not silently remove functionality to reduce output size.
- Never return only prose when the user requests a code change.

FINAL REVIEW
Before completing the response, inspect the generated source for:
- Missing imports and mismatched exports.
- Missing files and invalid paths.
- Invalid JSX, TypeScript, JSON, or CSS.
- Unsupported Tailwind syntax.
- Theme toggle wiring and theme variable usage.
- Invisible text and foreground/background mismatches.
- Empty image areas and unsafe fallback loops.
- Buttons without handlers.
- Mobile overflow and fixed-width layout problems.

This source review is not a browser test.
Do not claim a successful build, tested interactions, or verified images
unless those checks actually ran.

OUTPUT
- overview: at most two short factual sentences.
- steps: at most three concise setup/use instructions.
- Implementation belongs in previewFiles.
- fullStackFiles: [].
- For edits, deletedFilePaths contains only intentional deletions.
- Return the schema object without extra commentary.
`;
}

// ─────────────────────────────────────────────────────────────
// GENERATION ROUTE
// ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const {
      idea,
      tech,
      platform,
      messages = [],
      existingPlan,
    } = await req.json();

    if (typeof idea !== "string" || !idea.trim()) {
      return Response.json(
        {
          error: "Missing idea",
        },
        {
          status: 400,
        },
      );
    }

    // ─────────────────────────────────────────────────────────
    // CREDIT
    // ─────────────────────────────────────────────────────────

    const creditResult = await consumeGenerationCredit();

    if (!creditResult.ok) {
      return Response.json(
        {
          error: creditResult.error,
          credits: creditResult.credits,
        },
        {
          status: creditResult.status,
        },
      );
    }

    // ─────────────────────────────────────────────────────────
    // EXISTING PROJECT
    // ─────────────────────────────────────────────────────────

    const existingProject = existingPlan
      ? {
          overview: existingPlan.overview ?? "",
          previewFiles: existingPlan.previewFiles ?? [],
          dependencies: existingPlan.dependencies ?? {},
        }
      : null;

    const isUpdate = Boolean(
      existingProject &&
        Array.isArray(existingProject.previewFiles) &&
        existingProject.previewFiles.length > 0 &&
        Array.isArray(messages) &&
        messages.length > 0,
    );

    // Only keep recent chat context
    const recentMessages = Array.isArray(messages) ? messages.slice(-8) : [];

    const modelMessages: ModelMessage[] = [];

    if (isUpdate) {
      modelMessages.push({
        role: "user",
        content: parseMessageContent(
          `You are editing an existing CodewithChat project.

Original idea: ${idea.trim()}
Platform: ${platform || "Website"}

Apply ONLY the latest user request from the chat history.
Do not rebuild the app. Return only changed/added files in previewFiles.`,
        ),
      });

      modelMessages.push({
        role: "user",
        content: `CURRENT PROJECT FILES (copy unchanged files by omitting them)

${JSON.stringify(existingProject)}`,
      });
    } else {
      modelMessages.push({
        role: "user",
        content: parseMessageContent(
          `Build this project:

${idea.trim()}

Platform: ${platform || "Website"}

Generate the COMPLETE project using the canonical CodewithChat stack.`,
        ),
      });

      if (existingProject) {
        modelMessages.push({
          role: "user",
          content: `EXISTING PROJECT CODE

Modify this existing project instead of discarding it.
Return the COMPLETE final project after modifications.

${JSON.stringify(existingProject)}`,
        });
      }
    }

    // Chat history
    for (const message of recentMessages) {
      if (!message || typeof message.content !== "string") {
        continue;
      }

      if (message.role === "assistant") {
        modelMessages.push({
          role: "assistant",
          content: message.content,
        });

        continue;
      }

      modelMessages.push({
        role: "user",
        content: parseMessageContent(message.content),
      });
    }

    // ─────────────────────────────────────────────────────────
    // GENERATE
    // ─────────────────────────────────────────────────────────

    const result = await streamObject({
      model: google("gemini-2.5-flash"),

      schema: planSchema,

      system: getSystemPrompt({
        tech,
        platform,
        isUpdate,
      }),

      messages: modelMessages,
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    console.error("[Generate Project] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return Response.json(
      {
        error: "Failed to generate project",
        details: errorMessage,
      },
      {
        status: 500,
      },
    );
  }
}
