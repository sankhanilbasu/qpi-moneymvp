import { useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchPlaces, type LatLng, type PlaceResult } from "@/lib/geo";
import { LazyMap } from "./LazyMap";

export interface PickedLocation { position: LatLng; label: string }
export function LocationPicker({ value, onChange, center, label = "Location" }: { value: PickedLocation | null; onChange: (v: PickedLocation) => void; center: LatLng; label?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function search() {
    if (query.trim().length < 3) return;
    setBusy(true); setError("");
    try { const r = await searchPlaces(query, center); setResults(r); if (!r.length) setError("No places found."); }
    catch { setError("Search is unavailable — tap the map instead."); }
    finally { setBusy(false); }
  }
  return (
    <div className="flex flex-col gap-2">
      <form className="flex gap-2" onSubmit={e => { e.preventDefault(); void search(); }}>
        <Input aria-label={`Search ${label.toLowerCase()}`} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search an address or place" />
        <Button type="submit" variant="outline" size="icon" aria-label="Search address" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Search />}</Button>
      </form>
      {error && <p className="text-xs text-muted-foreground">{error}</p>}
      {results.length > 0 && <ul className="max-h-36 overflow-y-auto rounded-lg border border-border text-sm">{results.map(r => <li key={r.label}><button type="button" className="w-full px-3 py-2 text-left hover:bg-accent" onClick={() => { onChange(r); setResults([]); }}>{r.label}</button></li>)}</ul>}
      <LazyMap center={value?.position ?? center} markers={value ? [{ id: "pick", position: value.position, label, tone: "primary" }] : []} onPick={p => onChange({ position: p, label: `${p[0].toFixed(4)}, ${p[1].toFixed(4)}` })} />
      <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3 shrink-0" />{value ? value.label : "Tap the map or search to set a location"}</p>
    </div>
  );
}
