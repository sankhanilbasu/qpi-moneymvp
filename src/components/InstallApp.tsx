import { useEffect, useState, type ReactNode } from "react";
import { Download, Share, PlusSquare } from "lucide-react";
import { useInstallState } from "@/lib/app-state";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Install affordance. Renders the trigger only when the app can still be
 * installed: a native browser prompt where supported, or guided iOS steps.
 */
export function InstallApp({ children, className = "" }: { children: ReactNode; className?: string }) {
  const state = useInstallState();
  const [open, setOpen] = useState(false);

  if (state.kind === "installed" || state.kind === "unavailable") return null;

  if (state.kind === "prompt") {
    return (
      <button type="button" onClick={() => void state.install()} className={className}>
        {children}
      </button>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle>Install QPi</DialogTitle>
            <DialogDescription>Add QPi to your home screen for the full app experience.</DialogDescription>
          </DialogHeader>
          <ol className="flex flex-col gap-3 text-sm text-foreground">
            <li className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent">
                <Share className="h-4 w-4" />
              </span>
              Tap the <strong>Share</strong> button in Safari.
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent">
                <PlusSquare className="h-4 w-4" />
              </span>
              Choose <strong>Add to Home Screen</strong>.
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent">
                <Download className="h-4 w-4" />
              </span>
              Tap <strong>Add</strong> — QPi opens like a native app.
            </li>
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
}
