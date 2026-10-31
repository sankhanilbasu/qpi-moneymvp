import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/app-state";
import { getState } from "@/lib/sandbox-store";
import welcomeLogo from "@/assets/qpi-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QPi.money — Welcome" },
      { name: "description", content: "Earn trust, not just income. Join QPi.money to discover offers and create your own storefront." },
      { property: "og:title", content: "QPi.money — Welcome" },
      { property: "og:description", content: "Earn trust, not just income. Join QPi.money to discover offers and create your own storefront." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validEmail || !name.trim()) return;
    signIn({ name: name.trim(), email: email.trim().toLowerCase() });
    navigate({ to: getState().user?.onboarded ? "/discover" : "/onboarding" });
  }
  return (
    <div className="min-h-screen bg-muted">
      <main className="welcome-screen">
        <div className="welcome-brand">
          <h1 className="sr-only">QPi.money</h1>
          <img src={welcomeLogo} alt="QPi" width={1755} height={885} className="welcome-logo" />
        </div>
        <p className="welcome-tagline">Earn trust, not<br />just income.</p>
        <div className="welcome-actions">
          <Button onClick={() => setMode("login")} className="welcome-login">Login</Button>
          <Button variant="secondary" onClick={() => setMode("signup")} className="welcome-signup">Sign up</Button>
        </div>
      </main>
      <Dialog open={mode !== null} onOpenChange={open => !open && setMode(null)}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle>{mode === "signup" ? "Create your account" : "Welcome back"}</DialogTitle>
            <DialogDescription>Sandbox mode · no password needed. Data stays on this device.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5"><Label htmlFor="name">Name</Label><Input id="name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Morgan" required /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@example.com" required />{email && !validEmail && <p className="text-xs text-destructive">Enter a valid email.</p>}</div>
            <Button type="submit" className="mt-2 h-11 rounded-full" disabled={!validEmail || !name.trim()}>{mode === "signup" ? "Sign up (Sandbox)" : "Login (Sandbox)"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
