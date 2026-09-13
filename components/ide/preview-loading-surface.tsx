"use client";

import { useEffect, useRef, useState } from "react";
import { SandpackPreview, useSandpack } from "@codesandbox/sandpack-react";

const READY_MESSAGE = "codewithchat:preview-rendered:v1";
const ERROR_MESSAGE = "codewithchat:preview-error:v1";

export const READY_SCRIPT = String.raw`
<script>
(function () {
  if (window.__codewithchatPreviewBridgeInstalled) return;
  window.__codewithchatPreviewBridgeInstalled = true;

  function reportError(message) {
    window.parent.postMessage(
      {
        type: "${ERROR_MESSAGE}",
        message: String(message || "Unknown preview error").slice(0, 6000)
      },
      "*"
    );
  }

  window.addEventListener("error", function (event) {
    if (!event.message) return;

    reportError(
      event.message +
      (event.filename
        ? "\nFile: " + event.filename + ":" + event.lineno
        : "")
    );
  });

  window.addEventListener("unhandledrejection", function (event) {
    var reason = event.reason;

    reportError(
      reason && reason.message
        ? reason.message
        : String(reason || "Unhandled promise rejection")
    );
  });

  var timer = window.setInterval(function () {
    var root = document.getElementById("root");

    if (!root || !root.childElementCount) return;

    var visible = Array.from(root.querySelectorAll("*")).some(function (el) {
      var rect = el.getBoundingClientRect();
      var style = window.getComputedStyle(el);

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    });

    if (!visible) return;

    window.parent.postMessage(
      { type: "${READY_MESSAGE}" },
      "*"
    );
  }, 500);

  window.addEventListener("pagehide", function () {
    window.clearInterval(timer);
  }, { once: true });
})();
</script>
`;

type PreviewLoadingSurfaceProps = {
  onRetry: () => void;
  onError?: (message: string) => void;
  onAutoFix?: () => void;
  isRepairing?: boolean;
};

function isConnectionError(message: string): boolean {
  return /BroadcastChannel|bridge\/worker|unknown request ID|ERR_BLOCKED_BY_CLIENT|ERR_NETWORK|ERR_CONNECTION|Failed to fetch dynamically imported module/i.test(
    message,
  );
}

export function PreviewLoadingSurface({
  onRetry,
  onError,
  onAutoFix,
  isRepairing = false,
}: PreviewLoadingSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastReportedErrorRef = useRef<string | null>(null);

  const [ready, setReady] = useState(false);
  const [takingLong, setTakingLong] = useState(false);
  // const [showRuntime, setShowRuntime] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  const { sandpack } = useSandpack();

  const errorMessage = sandpack.error?.message || runtimeError;
  const connectionError = Boolean(
    errorMessage && isConnectionError(errorMessage),
  );

  const failed = Boolean(errorMessage) || sandpack.status === "timeout";

  const showOverlay = !ready || failed;

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const frame = containerRef.current?.querySelector<HTMLIFrameElement>(
        "iframe.sp-preview-iframe",
      );

      // Accept messages only from this preview iframe.
      if (!frame || event.source !== frame.contentWindow) return;

      const data = event.data;

      if (!data || typeof data !== "object") return;

      if (data.type === ERROR_MESSAGE) {
        if (typeof data.message !== "string" || !data.message.trim()) {
          return;
        }

        setRuntimeError(data.message.slice(0, 6000));
        // setShowRuntime(false);
        return;
      }

      if (data.type === READY_MESSAGE) {
        setReady(true);
        setTakingLong(false);
      }
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (!errorMessage) {
      lastReportedErrorRef.current = null;
      return;
    }

    if (!onError || lastReportedErrorRef.current === errorMessage) {
      return;
    }

    lastReportedErrorRef.current = errorMessage;
    onError(errorMessage);
  }, [errorMessage, onError]);

  useEffect(() => {
    if (ready || failed) return;

    const timer = window.setTimeout(() => {
      setTakingLong(true);
    }, 90000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [ready, failed, retryAttempt]);

  const handleRetry = () => {
    lastReportedErrorRef.current = null;

    setReady(false);
    setTakingLong(false);
    // setShowRuntime(false);
    setRuntimeError(null);
    setRetryAttempt((attempt) => attempt + 1);

    // Parent recreates the Sandpack runtime.
    onRetry();
  };

  const heading = isRepairing
    ? "Repairing your website"
    : failed
      ? "Preview couldn’t start"
      : takingLong
        ? "Preview is taking longer than usual"
        : "Bringing your website to life";

  const description = isRepairing
    ? "Applying a correction to your project files."
    : connectionError
      ? "The preview connection failed. Retry the preview to reconnect."
      : failed
        ? "The preview reported an error. Retry or repair the code."
        : takingLong
          ? "Your website has not rendered yet. Retry the preview."
          : "Your preview will appear here when it renders.";

  const canRepair =
    Boolean(errorMessage) && !connectionError && Boolean(onAutoFix);

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-0 w-full overflow-hidden"
    >
      <SandpackPreview
        showNavigator={false}
        showRefreshButton={false}
        showOpenInCodeSandbox={false}
        style={{ width: "100%", height: "100%" }}
      />

      {showOverlay && (
        <div className="absolute inset-0 z-50 flex items-center justify-center overflow-auto bg-[#101114] p-6">
          <div className="w-full max-w-sm text-center">
            <div className="relative mx-auto mb-7 flex h-28 w-40 items-center justify-center">
              <div
                aria-hidden="true"
                className={`absolute inset-4 rounded-full bg-white/10 blur-2xl ${
                  !failed || isRepairing
                    ? "animate-pulse motion-reduce:animate-none"
                    : ""
                }`}
              />

              <img
                src="/dark_logo.png"
                alt="CodewithChat"
                width={72}
                height={72}
                className={`relative object-contain ${
                  !failed || isRepairing
                    ? "animate-spin motion-reduce:animate-none"
                    : ""
                }`}
                style={{
                  width: 72,
                  height: 72,
                  animationDuration: "2s",
                }}
              />
            </div>

            <div role="status" aria-live="polite">
              <h2 className="text-base font-semibold text-white">{heading}</h2>

              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {description}
              </p>
            </div>

            {(failed || takingLong) && (
              <div className="mt-6 space-y-4">
                {errorMessage && (
                  <pre className="max-h-32 overflow-auto whitespace-pre-wrap wrap-break-word rounded-lg bg-white/5 p-3 text-left text-xs text-red-300">
                    {errorMessage}
                  </pre>
                )}

                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={isRepairing}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Retry preview
                  </button>

                  {canRepair && (
                    <button
                      type="button"
                      onClick={() => onAutoFix?.()}
                      disabled={isRepairing}
                      className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isRepairing ? "Repairing…" : "Fix code with AI"}
                    </button>
                  )}
                  {/* 
                  <button
                    type="button"
                    onClick={() => setShowRuntime(true)}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    View runtime
                  </button> */}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
