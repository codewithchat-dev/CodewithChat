"use client";

import { useEffect, useRef, useState } from "react";
import {
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react";

const READY_MESSAGE = "codewithchat:preview-rendered:v1";

export const READY_SCRIPT = `
<script>
(function () {
  var timer = window.setInterval(function () {
    var root = document.getElementById("root");
    if (!root || !root.childElementCount) return;

    var visible = Array.from(root.querySelectorAll("*")).some(function (el) {
      var rect = el.getBoundingClientRect();
      var style = window.getComputedStyle(el);

      return rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden";
    });

    if (visible) {
      window.parent.postMessage(
        { type: "${READY_MESSAGE}" },
        "*"
      );
    }
  }, 500);

  window.addEventListener("pagehide", function () {
    window.clearInterval(timer);
  }, { once: true });
})();
</script>
`;

export function PreviewLoadingSurface({
  onRetry,
}: {
  onRetry: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [showRuntime, setShowRuntime] = useState(false);
  const { sandpack } = useSandpack();

  const errorMessage = sandpack.error?.message;

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type !== READY_MESSAGE) return;

      const frame =
        containerRef.current?.querySelector<HTMLIFrameElement>(
          "iframe.sp-preview-iframe",
        );

      if (!frame || event.source !== frame.contentWindow) return;

      setReady(true);
      setTimedOut(false);
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (ready) return;

    const timer = window.setTimeout(() => setTimedOut(true), 90000);
    return () => window.clearTimeout(timer);
  }, [ready]);

  const failed =
    Boolean(errorMessage) ||
    sandpack.status === "timeout" ||
    timedOut;

  const showOverlay = !showRuntime && (!ready || failed);

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
            <div className="group relative mx-auto mb-7 flex h-28 w-40 items-center justify-center">
              <div
                aria-hidden="true"
                className={`absolute inset-4 rounded-full bg-white/10 blur-2xl ${
                  failed ? "" : "animate-pulse motion-reduce:animate-none"
                }`}
              />

              <img
  src="/dark_logo.png"
  alt={failed ? "CodewithChat" : "Loading preview"}
  width={72}
  height={72}
  className={`h-18 w-18 object-contain ${
    failed ? "" : "animate-spin motion-reduce:animate-none"
  }`}
  style={{ animationDuration: "2s" }}
/>
            </div>

            <div role="status" aria-live="polite">
              <h2 className="text-base font-semibold text-white">
                {failed
                  ? "Preview couldn’t start"
                  : "Bringing your website to life"}
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {failed
                  ? "Retry or open the runtime to inspect the problem."
                  : "Your preview will appear here when it renders."}
              </p>
            </div>

            {failed && (
              <div className="mt-6 space-y-4">
                {errorMessage && (
                  <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white/5 p-3 text-left text-xs text-red-300">
                    {errorMessage}
                  </pre>
                )}

                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={onRetry}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    Retry preview
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRuntime(true)}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    View runtime
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}