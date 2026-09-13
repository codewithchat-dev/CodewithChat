"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  Sparkles,
  Plus,
  Mic,
  MicOff,
  Globe2,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { HeroPreview } from "@/components/landing/hero-preview";

const PLACEHOLDER_PHRASES = [
  "Ask CodewithChat to build a college website...",
  "Ask CodewithChat to build an e-commerce store...",
  "Ask CodewithChat to build a portfolio website...",
  "Ask CodewithChat to build a healthcare scheduling app...",
  "Ask CodewithChat to build a social media clone...",
];

export function Hero() {
  const [idea, setIdea] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { userId } = useAuth();
  const clerk = useClerk();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setIdea((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          toast.error("Voice recognition failed. Please try again.");
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Typewriter effect for placeholder
  useEffect(() => {
    const currentPhrase = PLACEHOLDER_PHRASES[phraseIndex];
    const prefixLength = 20; // length of "Ask CodewithChat to "

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

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info("Listening... Speak now.");
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      toast.success(`Attached ${e.target.files[0].name}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    if (userId) {
      // Authenticated users can go straight to the builder.
      router.push(
        `/dashboard/project-builder?idea=${encodeURIComponent(idea)}`,
      );
    } else {
      // Keep one pending prompt for the auth redirect handler. The handler
      // owns the post-login redirect so Clerk and the handler cannot both
      // open the builder and create duplicate projects.
      if (typeof window !== "undefined") {
        localStorage.setItem("pending_idea", idea);
      }

      if (clerk.loaded) {
        try {
          clerk.openSignIn({
            forceRedirectUrl: "/dashboard",
          });
        } catch (error) {
          // If modal fails, redirect to sign-in page
          router.push("/sign-in?redirect_url=%2Fdashboard");
        }
      } else {
        router.push("/sign-in?redirect_url=%2Fdashboard");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-40 md:pb-24 flex flex-col items-center min-h-screen">
      {/* Faint radial glow at top */}
      <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-[30%] rounded-full bg-foreground/5 blur-[200px] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 -z-10 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-foreground/8 via-transparent to-transparent pointer-events-none" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 -z-10 pattern-grid opacity-[0.05] pointer-events-none"></div>

      <div className="mx-auto w-full max-w-5xl px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="mb-10 space-y-6">
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-7xl bg-gradient-to-br from-foreground via-foreground  bg-clip-text text-transparent">
              Build something{" "}
              <span className="text-primary">Extraordinary</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 font-medium max-w-2xl mx-auto leading-relaxed">
              Transform your ideas into production-ready applications through
              intelligent conversation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative w-full group">
            <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 blur-sm transition-all duration-500 group-hover:from-white/15 group-hover:via-white/8 group-hover:to-white/15"></div>
            <div className="relative flex flex-col bg-card/50 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-xl shadow-[0_2px_30px_rgba(0,0,0,0.4)] transition-all duration-300 focus-within:border-white/30 focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_50px_rgba(0,0,0,0.5)] overflow-hidden">
              <Textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="max-h-[300px] overflow-y-auto min-h-[120px] resize-none border-0 bg-transparent px-5 py-4 text-base md:text-lg focus-visible:ring-0 placeholder:text-foreground/60 shadow-none"
              />

              <div className="flex items-center justify-between px-4 pb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={!userId}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg size-9 text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
                    title={!userId ? "Sign in to attach files" : "Attach file"}
                  >
                    <Plus className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={!userId}
                    onClick={toggleListening}
                    className={`rounded-lg size-9 transition-colors ${isListening ? "text-red-500 bg-red-500/10 hover:text-red-600 hover:bg-red-500/20" : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"}`}
                    title={
                      !userId
                        ? "Sign in to use voice dictation"
                        : "Voice dictation"
                    }
                  >
                    {isListening ? (
                      <MicOff className="size-4 animate-pulse" />
                    ) : (
                      <Mic className="size-4" />
                    )}
                  </Button>
                  {/* Project type */}
                  <div className="ml-1 flex items-center gap-1.5">
                    <div
                      className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground"
                      aria-label="Frontend Website selected"
                    >
                      <Globe2 className="size-3.5" aria-hidden="true" />
                      <span>Frontend</span>
                    </div>

                    <div className="group relative flex items-center">
                      <button
                        type="button"
                        aria-disabled="true"
                        aria-label="Full-Stack Web App — Coming soon"
                        onClick={(event) => event.preventDefault()}
                        className="flex size-9 cursor-not-allowed items-center justify-center rounded-full border border-border/40 bg-muted/20 text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Database className="size-4" aria-hidden="true" />
                      </button>

                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5 text-[11px] text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                      >
                        Full-stack · Coming soon
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="icon"
                  className="rounded-lg size-10 bg-primary hover:bg-brand-hover text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200"
                  disabled={!idea.trim()}
                >
                  <ArrowUp className="size-5" />
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
            {[
              "Build a college website",
              "Create an e-commerce store",
              "Make a portfolio website",
              "Build a healthcare scheduling app",
            ].map((suggestion, i) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setIdea(suggestion)}
                className="rounded-lg border border-border/60 bg-background/80 px-4 py-2 text-xs font-medium text-foreground/90 transition-all hover:bg-surface-hover hover:text-foreground hover:border-border/80 shadow-sm hover:shadow-md"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="w-full mt-20 md:mt-28">
            <HeroPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
