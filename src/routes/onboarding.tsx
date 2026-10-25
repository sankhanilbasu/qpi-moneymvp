import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { IdUpload } from "@/components/IdUpload";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationPicker, type PickedLocation } from "@/components/maps/LocationPicker";
import { isSignedIn } from "@/lib/app-state";
import { fileToDataUrl } from "@/lib/images";
import { SANDBOX_CENTER } from "@/lib/discovery";
import { createUser, updateUser, useSandbox } from "@/lib/sandbox-store";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — QPi.money" },
      { name: "description", content: "Set up your QPi.money profile, home location and sandbox ID check." },
      { property: "og:title", content: "Get started — QPi.money" },
      { property: "og:description", content: "Set up your QPi.money profile, home location and sandbox ID check." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const { user } = useSandbox();
  const [name, setName] = useState("");
  const [home, setHome] = useState<PickedLocation | null>(null);
  useEffect(() => {
    if (!isSignedIn()) { navigate({ to: "/" }); return; }
    if (!user) createUser("Guest", "guest@sandbox.local");
  }, [navigate, user]);
  useEffect(() => { if (user) { setName(n => n || user.name); if (user.home) setHome(h => h ?? { position: user.home!, label: "Saved home" }); } }, [user]);

  async function pickPhoto(file: File) {
    try { updateUser({ avatar: await fileToDataUrl(file, 256) }); } catch (e) { toast.error((e as Error).message); }
  }
  function finish() {
    updateUser({ name: name.trim() || "Guest", home: home?.position, onboarded: true });
    navigate({ to: "/discover" });
  }
  return (
    <div className="min-h-screen bg-muted">
      <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 bg-background px-5 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <div><p className="text-xs font-medium uppercase tracking-wider text-primary">Sandbox account</p><h1 className="mt-1 text-2xl font-semibold">Set up your profile</h1><p className="mt-1 text-sm text-muted-foreground">Everyone can shop and open a storefront.</p></div>
        <label className="flex cursor-pointer items-center gap-4">
          <span className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-muted">{user?.avatar ? <img src={user.avatar} alt="Your profile" className="h-full w-full object-cover" /> : <Camera className="h-6 w-6 text-muted-foreground" />}</span>
          <span className="text-sm font-medium text-primary">{user?.avatar ? "Change photo" : "Add profile photo"}</span>
          <input type="file" accept="image/*" className="sr-only" aria-label="Profile photo" onChange={e => { const f = e.target.files?.[0]; if (f) void pickPhoto(f); }} />
        </label>
        <div className="flex flex-col gap-1.5"><Label htmlFor="display">Display name</Label><Input id="display" value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="flex flex-col gap-1.5"><Label>Home location</Label><LocationPicker value={home} onChange={setHome} center={SANDBOX_CENTER} label="Home location" /></div>
        <IdUpload />
        <Button className="h-12 rounded-full" onClick={finish} disabled={!name.trim()}>Continue</Button>
        <Button variant="ghost" onClick={finish}>Skip for now</Button>
      </main>
    </div>
  );
}
