"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addProjectAction } from "@/app/actions/projects";
import { getCreditsAction } from "@/app/actions/credits";
import Link from "next/link";
import { Clock, Pin } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useProjectHistory } from "@/hooks/use-project-history";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PromptComposer,
  type ProjectType,
} from "@/components/dashboard/prompt-composer";
import { MAX_DAILY_CREDITS } from "@/lib/credits";

const PLACEHOLDER_PHRASES = [
  "Build a college website...",
  "Build an e-commerce store...",
  "Build a portfolio website...",
  "Build a healthcare scheduling app...",
  "Build a social media clone...",
];

export default function DashboardPage() {
  const [idea, setIdea] = useState("");
  const [tech, setTech] = useState("React + Vite");
  const [platform, setPlatform] = useState("Website");
  const [agent, setAgent] = useState("Gemini 3.5 Flash");
  const [credits, setCredits] = useState(MAX_DAILY_CREDITS);
  const [placeholder, setPlaceholder] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const { projects, pinnedProjects, togglePin, getTimeAgo } =
    useProjectHistory();

  useEffect(() => {
    getCreditsAction().then((res) => {
      if (res.success) setCredits(res.credits);
    });
  }, []);

  // Typewriter effect for placeholder
  useEffect(() => {
    const currentPhrase = PLACEHOLDER_PHRASES[phraseIndex];
    const prefixLength = 6; // length of "Build "

    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      if (charIndex > prefixLength) {
        timeout = setTimeout(() => {
          setPlaceholder(currentPhrase.substring(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        }, 20); // super fast deletion
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % PLACEHOLDER_PHRASES.length);
      }
    } else {
      if (charIndex < currentPhrase.length) {
        timeout = setTimeout(() => {
          setPlaceholder(currentPhrase.substring(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        }, 40); // fast typing speed
      } else {
        // Pause at the end of the phrase
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 1200); // shorter pause
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex]);

  const handleSubmit = async (
    attachedImage?: string | null,
    projectType: ProjectType = "frontend",
  ) => {
    if (!idea.trim() && !attachedImage) return;
    if (credits <= 0) {
      toast.error("Daily credits used up. Upgrade to start building.");
      return;
    }
    const toastId = toast.loading("Initializing workspace...");
    try {
      const projectTypeInstruction =
        projectType === "fullstack"
          ? "Build this as a full-stack web app with a real database, authentication, API routes, and persistent data."
          : "Build this as a frontend website with polished responsive UI and client-side interactions.";
      const finalIdea = `${idea}\n\nProject type: ${projectTypeInstruction}${
        attachedImage ? `\n\n[IMAGE: ${attachedImage}]` : ""
      }`;

      const projectTitle =
  idea.trim().replace(/\s+/g, " ").slice(0, 80) ||
  "Image-based project";

const res = await addProjectAction(projectTitle, finalIdea);
      if (res.success && res.data) {
        toast.success("Workspace created!", { id: toastId });
        router.push(
          `/dashboard/project/${res.data.id}?tech=${encodeURIComponent(tech)}&platform=${encodeURIComponent(platform)}&agent=${encodeURIComponent(agent)}`,
        );
      } else {
        toast.dismiss(toastId);
        toast.error("Failed to create project");
      }
    } catch {
      toast.dismiss(toastId);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center p-4 md:p-8 overflow-y-auto">
      {/* Background glowing effects */}
      <div className="absolute inset-0 -z-20 bg-background"></div>
      <div className="absolute top-0 left-1/2 -z-20 h-[800px] w-[1200px] -translate-x-1/2 -translate-y-[30%] rounded-full bg-primary/40 blur-[200px] pointer-events-none"></div>
      <div className="absolute top-0 inset-x-0 -z-20 h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent pointer-events-none"></div>

      <div className="w-full max-w-6xl flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 pt-10 pb-20">
        <div className="flex-1 flex flex-col justify-center min-h-[50vh]">
          <h1 className="text-center text-3xl md:text-5xl font-semibold tracking-tight mb-8 text-foreground">
            What are you building today
            {user?.firstName ? `, ${user.firstName}` : ""}?
          </h1>

          <div className="w-full mb-10 max-w-3xl mx-auto">
            <PromptComposer
              value={idea}
              onChange={setIdea}
              onSubmit={handleSubmit}
              placeholder={placeholder}
              submitHint="Start building"
            />
          </div>
        </div>

        {/* Recent Projects Dock */}
        <div
          className="w-full mt-10 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 shadow-sm"
          style={{
            backgroundImage:
              "radial-gradient(oklch(0.55 0 0 / 0.08) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        >
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-sm font-medium text-foreground/90 flex items-center gap-2">
              <Clock className="size-4" />
              Your Recent Generations
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {projects
              .slice(0, showAll ? projects.length : 8)
              .map((project, i) => {
                // Premium monochromatic gradient variation per card (no colors, just depth)
                const lightness = 20 + (i % 4) * 8;
                return (
                  <Link
                    key={project.id}
                    href={`/dashboard/project/${project.id}`}
                    className="group flex flex-col rounded-xl border border-border/70 bg-card/60 hover:bg-card transition-all duration-300 hover:border-foreground/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden"
                  >
                    {/* Monochromatic Thumbnail */}
                    <div
                      className="h-36 w-full border-b border-border/50 flex items-end justify-center overflow-hidden relative p-4 pb-0"
                      style={{
                        background: `linear-gradient(160deg, oklch(${0.12 + (i % 4) * 0.03} 0 0) 0%, oklch(0.18 0 0) 100%)`,
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          togglePin(project.id, e as any);
                        }}
                        className={`absolute top-3 right-3 z-10 p-1.5 rounded-md transition-all ${
                          pinnedProjects.some((p) => p.id === project.id)
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground/50 hover:text-foreground hover:bg-white/10 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                        }`}
                      >
                        <Pin
                          className={`size-4 ${pinnedProjects.some((p) => p.id === project.id) ? "fill-primary/20" : ""}`}
                        />
                      </button>
                      {/* Subtle metallic sheen overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `radial-gradient(ellipse at 30% 0%, oklch(${0.55 + (i % 4) * 0.05} 0 0 / 0.15), transparent 70%)`,
                        }}
                      />
                      <div className="w-full h-[90%] bg-background/80 backdrop-blur rounded-t-lg shadow-sm border border-white/10 border-b-0 flex flex-col pt-2.5 px-3 transform group-hover:-translate-y-1 transition-transform duration-300">
                        {/* Monochrome browser dots */}
                        <div className="flex gap-1.5 mb-3">
                          <div className="size-2 rounded-full bg-foreground/20" />
                          <div className="size-2 rounded-full bg-foreground/15" />
                          <div className="size-2 rounded-full bg-foreground/10" />
                        </div>
                        {/* Fake content blocks - shimmer style */}
                        <div className="w-1/3 h-1.5 bg-foreground/20 rounded-full mb-3" />
                        <div className="w-3/4 h-1.5 bg-foreground/10 rounded-full mb-2" />
                        <div className="w-1/2 h-1.5 bg-foreground/10 rounded-full mb-2" />
                        <div className="w-2/3 h-1.5 bg-foreground/5 rounded-full" />
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-sm truncate text-foreground">
                          {project.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1.5 py-0 font-medium tracking-wider uppercase bg-primary/10 text-primary hover:bg-primary/20 border-0"
                        >
                          App
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground/80 line-clamp-2 mb-4 leading-relaxed">
                        {project.prompt}
                      </p>
                      <div className="mt-auto flex items-center justify-between text-[10px] font-medium text-foreground/80">
                        <span>{getTimeAgo(project.updatedAt)}</span>
                        <div className="flex items-center gap-1.5">
                          <div className="size-1.5 rounded-full bg-primary" />
                          <span>React + TS</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            {projects.length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed rounded-xl border-border/60 bg-muted/10">
                <p className="text-sm text-foreground/80">
                  No projects yet. Build your first app above!
                </p>
              </div>
            )}
          </div>

          {projects.length > 8 && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="rounded-full px-6 bg-background/50 hover:bg-background"
              >
                {showAll ? "Show Less" : "See All Projects"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
