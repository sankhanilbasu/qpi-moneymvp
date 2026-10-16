import { useEffect, useState } from "react";

// Demo-only session, not authentication. All users have the same access:
// shopping is the default and storefront setup is available to everyone.
export function isSignedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("qpi.session") === "active" || ["consumer", "producer"].includes(localStorage.getItem("qpi.role") ?? "");
}
export function signIn() {
  localStorage.setItem("qpi.session", "active");
  localStorage.removeItem("qpi.role");
}
export function signOut() {
  localStorage.removeItem("qpi.session");
  localStorage.removeItem("qpi.role");
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
export function useInstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  useEffect(() => {
    const h = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  return evt
    ? async () => {
        await evt.prompt();
        setEvt(null);
      }
    : null;
}
