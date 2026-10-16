import { useEffect, useState } from "react";

export type Role = "consumer" | "producer";

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem("qpi.role") as Role | null) ?? null;
}
export function signIn(role: Role) {
  localStorage.setItem("qpi.role", role);
}
export function signOut() {
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
