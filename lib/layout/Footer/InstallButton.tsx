"use client";

import { Popover } from "antd";
import { ArrowDownToLine } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const neverChanges = () => () => {};

function useIsIOS() {
  return useSyncExternalStore(
    neverChanges,
    () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window),
    () => false,
  );
}

function useIsStandalone() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia("(display-mode: standalone)");
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS before 16.4 never matches the display-mode query.
      ("standalone" in navigator && navigator.standalone === true),
    () => false,
  );
}

const InstallButton = () => {
  const isIOS = useIsIOS();
  const isStandalone = useIsStandalone();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    function onAppInstalled() {
      setInstallEvent(null);
      setIsInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  async function install() {
    if (!installEvent) {
      return;
    }
    await installEvent.prompt();
    await installEvent.userChoice;
    // The event is single-use: the browser fires a fresh one on a later visit.
    setInstallEvent(null);
  }

  if (isStandalone || isInstalled) {
    return null; // Don't show install button if already installed
  }

  const installTrigger = (
    <button
      type="button"
      onClick={isIOS ? undefined : install}
      aria-label="Install app"
      aria-expanded={isIOS ? isHintOpen : undefined}
      className="flex text-slate-300 transition-colors hover:text-slate-200!"
    >
      <ArrowDownToLine size={16} aria-hidden="true" />
    </button>
  );

  if (!isIOS) {
    return <div className="flex items-center">{installTrigger}</div>;
  }

  return (
    <div className="flex items-center">
      <Popover
        open={isHintOpen}
        onOpenChange={setIsHintOpen}
        trigger="click"
        placement="topRight"
        color="#1e293b" // slate-800
        content={
          <p className="w-52 text-xs leading-relaxed text-slate-300">
            To install, tap the share button
            <span role="img" aria-label="share icon">
              {" "}
              ⎋{" "}
            </span>
            and then &quot;Add to Home Screen&quot;
            <span role="img" aria-label="plus icon">
              {" "}
              ➕{" "}
            </span>
            .
          </p>
        }
      >
        {installTrigger}
      </Popover>
    </div>
  );
};

export default InstallButton;
