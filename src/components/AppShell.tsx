import { Link, useNavigate } from "@tanstack/react-router";
import { Compass, MessageCircle, PlusSquare, User, Moon, Sun, Download, ArrowLeft } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { isSignedIn, useInstallPrompt, useTheme } from "@/lib/app-state";
import { getState } from "@/lib/sandbox-store";
import logo from "@/assets/qpi-logo.png";

const tabs = [
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/create", label: "Create", icon: PlusSquare },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ title, children, spatial = false, back, actions }: { title: string; children: ReactNode; spatial?: boolean; back?: (() => void) | undefined; actions?: ReactNode }) {
  const { dark, toggle } = useTheme();
  const install = useInstallPrompt();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isSignedIn()) navigate({ to: "/" });
    else if (!getState().user?.onboarded) navigate({ to: "/onboarding" });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-muted">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-background shadow-xl">
        <header className="sticky top-0 z-[600] flex items-center justify-between border-b border-border bg-background/85 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur">
          <div className="flex min-w-0 items-center gap-2">
            {back ? <button onClick={back} aria-label="Back" className="-ml-2 rounded-full p-2 hover:bg-accent"><ArrowLeft className="h-5 w-5" /></button> : <img src={logo} alt="QPi" width={1755} height={885} className="h-7 w-auto" />}
            <h1 className="sr-only">{title}</h1>
          </div>
          <div className="flex items-center gap-1">
            {actions}
            {install && (
              <button onClick={install} aria-label="Install app" className="rounded-full p-2 text-primary hover:bg-accent">
                <Download className="h-5 w-5" />
              </button>
            )}
            <button onClick={toggle} aria-label="Toggle theme" className="rounded-full p-2 hover:bg-accent">
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </header>
        <main className={spatial ? "flex-1 pb-[calc(64px+env(safe-area-inset-bottom))]" : "flex-1 px-4 py-4 pb-28"}>{children}</main>
        <nav className="fixed bottom-0 left-1/2 z-[600] w-full max-w-md -translate-x-1/2 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <ul className="grid grid-cols-4">
            {tabs.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground"
                  activeProps={{ className: "text-primary" }}
                >
                  <Icon className="h-6 w-6" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border bg-card p-4 ${className}`}>{children}</div>;
}
