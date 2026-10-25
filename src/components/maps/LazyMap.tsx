import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import type { SandboxMapProps } from "./SandboxMap";

const SandboxMap = lazy(() => import("./SandboxMap"));
const Loading = () => <div className="grid h-full place-items-center text-sm text-muted-foreground" role="status">Loading map…</div>;

/** Leaflet stays out of SSR: lazy import rendered only on the client. */
export function LazyMap(props: SandboxMapProps & { className?: string }) {
  const { className = "h-56", ...rest } = props;
  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-muted ${className}`}>
      <ClientOnly fallback={<Loading />}><Suspense fallback={<Loading />}><SandboxMap {...rest} /></Suspense></ClientOnly>
    </div>
  );
}
