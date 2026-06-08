import { useEffect, useMemo, useState } from "react";
import { Download, Share2, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const INSTALL_DISMISSED_KEY = "hrm360:pwa-install-dismissed";

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

const isMobileDevice = () =>
  /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);

const isIosDevice = () =>
  /iPhone|iPad|iPod/i.test(window.navigator.userAgent);

const PwaInstallPrompt = () => {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const isIos = useMemo(
    () => typeof window !== "undefined" && isIosDevice(),
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY) === "true";
    const alreadyInstalled = isStandalone();

    setIsInstalled(alreadyInstalled);

    if (dismissed || alreadyInstalled || !isMobileDevice()) return;

    const showTimer = window.setTimeout(() => {
      if (isIos) setIsVisible(true);
    }, 2500);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setInstallEvent(null);
      localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isIos]);

  const dismissPrompt = () => {
    setIsVisible(false);
    localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
  };

  const installApp = async () => {
    if (!installEvent) return;

    await installEvent.prompt();
    const choice = await installEvent.userChoice;

    if (choice.outcome === "accepted") {
      localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
    }

    setInstallEvent(null);
    setIsVisible(false);
  };

  if (!isVisible || isInstalled) return null;

  return (
    <div className="fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[120] mx-auto max-w-md rounded-3xl border border-white/70 bg-white/95 p-4 shadow-2xl shadow-[#3B00D9]/20 backdrop-blur-xl">
      <button
        type="button"
        onClick={dismissPrompt}
        className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        aria-label="Dismiss install prompt"
      >
        <X size={16} />
      </button>

      <div className="flex gap-3 pr-7">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3B00D9] text-white shadow-lg shadow-[#3B00D9]/25">
          {isIos ? <Share2 size={21} /> : <Download size={21} />}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-950">
            Install HRM360 on your phone
          </p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            {isIos
              ? "On iPhone, tap the Share button in Safari, then choose Add to Home Screen."
              : "Add HRM360 to your home screen for faster access and an app-like experience."}
          </p>
        </div>
      </div>

      {!isIos && installEvent && (
        <button
          type="button"
          onClick={installApp}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3B00D9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3500c0]"
        >
          <Download size={16} />
          Install app
        </button>
      )}
    </div>
  );
};

export default PwaInstallPrompt;
