import { useEffect, useState } from "react";
import { clearSandbox, createUser } from "./sandbox-store";

// Sandbox session, not authentication. All users have the same access:
// shopping is the default and storefront setup is available to everyone.
export function isSignedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("qpi.session") === "active" || ["consumer", "producer"].includes(localStorage.getItem("qpi.role") ?? "");
}
export function signIn(profile?: { name: string; email: string }) {
  localStorage.setItem("qpi.session", "active");
  localStorage.removeItem("qpi.role");
  if (profile) createUser(profile.name, profile.email);
}
/** Signing out clears every piece of sandbox data on this device. */
export function signOut() {
  localStorage.removeItem("qpi.session");
  localStorage.removeItem("qpi.role");
  clearSandbox();
}

export function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(localStorage.getItem("qpi.theme") === "dark");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  const toggle = () => {
    const next = !dark;
    localStorage.setItem("qpi.theme", next ? "dark" : "light");
    setDark(next);
  };
  return { dark, toggle };
}

type BIPEvent = Event & { prompt: () => Promise<void> };

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}

export type InstallState =
  | { kind: "prompt"; install: () => Promise<void> } // browser offers native prompt (Chrome/Android/Edge)
  | { kind: "ios" } // iOS Safari: no programmatic prompt, show manual steps
  | { kind: "installed" }
  | { kind: "unavailable" }; // desktop browser without install support

export function useInstallState(): InstallState {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(isInstalled);
  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setEvt(null);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  if (installed) return { kind: "installed" };
  if (evt)
    return {
      kind: "prompt",
      install: async () => {
        await evt.prompt();
        setEvt(null);
      },
    };
  if (isIos()) return { kind: "ios" };
  return { kind: "unavailable" };
}

/** Back-compat: returns a trigger only when the browser offers a native prompt. */
export function useInstallPrompt() {
  const state = useInstallState();
  return state.kind === "prompt" ? state.install : null;
}
