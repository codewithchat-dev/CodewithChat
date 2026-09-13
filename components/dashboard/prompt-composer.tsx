"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

import {
  ArrowUp,
  Plus,
  Mic,
  MicOff,
  X,
  ChevronDown,
  Globe2,
  Database,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Future mein full-stack enable karne ke liye true karo.
const FULLSTACK_ENABLED: boolean = false;

export type ProjectType = "frontend" | "fullstack";

interface PromptComposerProps {
  value: string;
  onChange: (value: string) => void;

  onSubmit: (
    attachedImage?: string | null,
    projectType?: ProjectType,
  ) => void;

  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  compact?: boolean;
  submitHint?: string;
}

interface RecognitionResultEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface RecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type RecognitionConstructor = new () => RecognitionInstance;

export function PromptComposer({
  value,
  onChange,
  onSubmit,
  loading = false,
  disabled = false,
  placeholder = "Ask a question or request a change…",
  compact = false,
  submitHint,
}: PromptComposerProps) {
  const [isListening, setIsListening] = useState(false);

  const [attachedImage, setAttachedImage] =
    useState<string | null>(null);

  const [projectType, setProjectType] =
    useState<ProjectType>("frontend");

  const effectiveProjectType: ProjectType =
    FULLSTACK_ENABLED ? projectType : "frontend";

  const blocked = disabled || loading;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<FileReader | null>(null);

  const recognitionRef =
    useRef<RecognitionInstance | null>(null);

  const latestInputRef = useRef({
    value,
    onChange,
    blocked,
  });

  useEffect(() => {
    latestInputRef.current = {
      value,
      onChange,
      blocked,
    };
  }, [value, onChange, blocked]);

  // Voice input
  useEffect(() => {
    const browser = window as Window & {
      SpeechRecognition?: RecognitionConstructor;
      webkitSpeechRecognition?: RecognitionConstructor;
    };

    const Recognition =
      browser.SpeechRecognition ||
      browser.webkitSpeechRecognition;

    if (!Recognition) return;

    const recognition = new Recognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[0]?.[0]?.transcript?.trim();

      const current = latestInputRef.current;

      if (transcript && !current.blocked) {
        current.onChange(
          current.value
            ? `${current.value} ${transcript}`
            : transcript,
        );
      }

      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice recognition failed. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;

      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (blocked) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  }, [blocked]);

  useEffect(() => {
    return () => {
      readerRef.current?.abort();
    };
  }, []);

  function toggleListening() {
    if (blocked) return;

    const recognition = recognitionRef.current;

    if (!recognition) {
      toast.error(
        "Speech recognition is not supported in this browser.",
      );
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    try {
      recognition.start();
      setIsListening(true);
      toast.info("Listening…");
    } catch {
      setIsListening(false);
      toast.error("Could not start voice recognition.");
    }
  }

  function handleSubmitClick() {
    if (blocked || (!value.trim() && !attachedImage)) return;

    recognitionRef.current?.stop();
    setIsListening(false);

    // Both Enter and the send button use the same project type.
    onSubmit(attachedImage, effectiveProjectType);

    setAttachedImage(null);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      handleSubmitClick();
    }
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file || blocked) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image is too large. Maximum size is 4 MB.");
      return;
    }

    readerRef.current?.abort();

    const reader = new FileReader();
    readerRef.current = reader;

    reader.onload = () => {
      if (
        typeof reader.result === "string" &&
        !latestInputRef.current.blocked
      ) {
        setAttachedImage(reader.result);
      }

      readerRef.current = null;
    };

    reader.onerror = () => {
      readerRef.current = null;
      toast.error("Could not read the image. Please try again.");
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="relative w-full">
      <div
        className="
          relative flex flex-col overflow-hidden
          rounded-2xl border border-white/10
          bg-card/50 backdrop-blur-xl
          shadow-[0_2px_20px_rgba(0,0,0,0.3)]
          transition-all duration-300
          hover:border-white/20
          focus-within:border-white/30
          focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.4)]
        "
      >
        {attachedImage && (
          <div className="flex gap-2 px-4 pt-4">
            <div className="relative inline-block">
              <img
                src={attachedImage}
                alt="Attached preview"
                className="h-16 w-16 rounded-md border border-border/50 object-cover shadow-sm"
              />

              <button
                type="button"
                disabled={blocked}
                onClick={() => setAttachedImage(null)}
                aria-label="Remove attached image"
                className="
                  absolute -right-2 -top-2
                  rounded-full border border-border
                  bg-background p-1
                  text-muted-foreground shadow-sm
                  hover:text-foreground
                  disabled:opacity-50
                "
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        )}

        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={blocked}
          placeholder={placeholder}
          aria-label="Project prompt"
          className={`
            ${
              compact
                ? attachedImage
                  ? "min-h-[40px]"
                  : "min-h-[88px]"
                : attachedImage
                  ? "min-h-[60px]"
                  : "min-h-[120px]"
            }
            max-h-[300px] resize-none overflow-y-auto
            border-0 bg-transparent px-4 py-4
            text-sm shadow-none
            placeholder:text-foreground/60
            focus-visible:ring-0
            disabled:opacity-60
          `}
        />

        <div className="flex items-center justify-between gap-2 px-3 pb-3">
          <div className="flex min-w-0 items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              disabled={blocked}
              className="hidden"
              onChange={handleFileChange}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={blocked}
              onClick={() => fileInputRef.current?.click()}
              className="size-9 rounded-full text-muted-foreground hover:text-foreground"
              title="Attach image"
              aria-label="Attach image"
            >
              <Plus className="size-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={blocked}
              onClick={toggleListening}
              title={isListening ? "Stop dictation" : "Voice dictation"}
              aria-label={
                isListening ? "Stop dictation" : "Voice dictation"
              }
              aria-pressed={isListening}
              className={`
                size-9 rounded-full
                ${
                  isListening
                    ? "bg-red-500/10 text-red-500"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              {isListening ? (
                <MicOff className="size-4 animate-pulse" />
              ) : (
                <Mic className="size-4" />
              )}
            </Button>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={blocked}
                  aria-label="Select project type"
                  className="
                    flex items-center gap-1.5
                    rounded-full border border-border/50
                    bg-muted/30 px-2.5 py-1.5
                    text-[11px] font-medium text-muted-foreground
                    transition-colors
                    hover:bg-muted/60
                    disabled:opacity-50
                  "
                >
                  {effectiveProjectType === "frontend" ? (
                    <Globe2 className="size-3.5" />
                  ) : (
                    <Database className="size-3.5" />
                  )}

                  <span>
                    {effectiveProjectType === "frontend"
                      ? "Frontend"
                      : "Full-Stack"}
                  </span>

                  <ChevronDown className="size-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="w-52"
              >
                <DropdownMenuItem
                  onSelect={() => setProjectType("frontend")}
                  className="cursor-pointer gap-2"
                >
                  <Globe2 className="size-4" />

                  <div className="flex flex-col">
                    <span>Frontend Website</span>

                    <span className="text-[10px] text-muted-foreground">
                      UI-focused and fast
                    </span>
                  </div>
                </DropdownMenuItem>

                {FULLSTACK_ENABLED ? (
                  <DropdownMenuItem
                    onSelect={() => setProjectType("fullstack")}
                    className="cursor-pointer gap-2"
                  >
                    <Database className="size-4" />

                    <div className="flex flex-col">
                      <span>Full-Stack Web App</span>

                      <span className="text-[10px] text-muted-foreground">
                        Database, auth and APIs
                      </span>
                    </div>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    aria-disabled="true"
                    aria-label="Full-Stack Web App — Coming soon"
                    onSelect={(event) => event.preventDefault()}
                    className="group relative min-h-9 cursor-not-allowed gap-2"
                  >
                    <Database
                      aria-hidden="true"
                      className="size-4 text-muted-foreground/50"
                    />

                    <span
                      aria-hidden="true"
                      className="
                        pointer-events-none absolute left-9
                        whitespace-nowrap text-[11px]
                        text-muted-foreground opacity-0
                        transition-opacity
                        group-hover:opacity-100
                        group-data-[highlighted]:opacity-100
                      "
                    >
                      Coming soon
                    </span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            type="button"
            size="icon"
            onClick={handleSubmitClick}
            disabled={
              blocked || (!value.trim() && !attachedImage)
            }
            title={submitHint || "Send"}
            aria-label={submitHint || "Send"}
            className="
              size-10 shrink-0 rounded-full
              border border-foreground/20
              bg-foreground/10 text-foreground
              transition-all duration-200
              hover:border-foreground
              hover:bg-foreground
              hover:text-background
            "
          >
            {loading ? (
              <Spinner className="size-4" />
            ) : (
              <ArrowUp className="size-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}