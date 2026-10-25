import { BadgeCheck, Clock, IdCard } from "lucide-react";
import { updateUser, useSandbox } from "@/lib/sandbox-store";

/** Mocked ID review: pending, then verified after a short sandbox delay. */
export function startIdCheck(fileName: string) {
  updateUser({ idStatus: "pending", idFileName: fileName });
  setTimeout(() => updateUser({ idStatus: "verified" }), 2500);
}

export function IdUpload() {
  const { user } = useSandbox();
  const status = user?.idStatus ?? "none";
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-center gap-2 text-sm font-medium"><IdCard className="h-4 w-4 text-primary" />Government ID <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">Sandbox</span></div>
      {status === "none" && <label className="mt-2 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-border py-4 text-sm text-muted-foreground hover:bg-accent">
        Upload a photo of your ID
        <input type="file" accept="image/*" className="sr-only" aria-label="Upload government ID" onChange={e => { const f = e.target.files?.[0]; if (f) startIdCheck(f.name); }} />
      </label>}
      {status === "pending" && <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4 animate-pulse" />Pending review · {user?.idFileName}</p>}
      {status === "verified" && <p className="mt-2 flex items-center gap-2 text-sm"><BadgeCheck className="h-4 w-4 text-primary" />Verified (Sandbox) · not a real identity check</p>}
    </div>
  );
}

