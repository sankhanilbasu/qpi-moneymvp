import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLng } from "@/lib/geo";

export interface MapMarker { id: string; position: LatLng; label: string; tone: "primary" | "pickup" | "dropoff" | "courier" }
export interface SandboxMapProps { center: LatLng; zoom?: number | undefined; markers: MapMarker[]; path?: LatLng[] | undefined; onPick?: ((p: LatLng) => void) | undefined; fit?: boolean | undefined }

const glyph = { primary: "●", pickup: "A", dropoff: "B", courier: "➤" } as const;

function Layers({ markers, onPick, fit, center }: SandboxMapProps) {
  const map = useMap();
  useMapEvents({ click: e => onPick?.([e.latlng.lat, e.latlng.lng]) });
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  useEffect(() => {
    const layers = markers.map(m => {
      const el = document.createElement("div");
      el.className = `sandbox-pin sandbox-pin-${m.tone}`;
      el.textContent = glyph[m.tone];
      el.title = m.label; el.setAttribute("aria-label", m.label);
      return L.marker(m.position, { icon: L.divIcon({ html: el, className: "merchant-marker-host", iconSize: [32, 32], iconAnchor: [16, 16] }), keyboard: false, zIndexOffset: m.tone === "courier" ? 1000 : 0 }).addTo(map);
    });
    return () => layers.forEach(l => l.remove());
  }, [map, markers]);
  const fitKey = fit ? markers.filter(m => m.tone !== "courier").map(m => m.position.join(",")).join("|") : "";
  useEffect(() => {
    if (!fit) { map.setView(center, map.getZoom(), { animate: false }); return; }
    const pts = markers.filter(m => m.tone !== "courier").map(m => m.position);
    if (pts.length > 1) map.fitBounds(L.latLngBounds(pts), { padding: [40, 40] });
    else if (pts[0]) map.setView(pts[0], 15);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, fitKey, fit, center[0], center[1]]);
  return null;
}

export default function SandboxMap(props: SandboxMapProps) {
  return (
    <MapContainer center={props.center} zoom={props.zoom ?? 14} minZoom={4} maxZoom={18} className="sandbox-leaflet" scrollWheelZoom>
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution={'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'} />
      {props.path && props.path.length > 1 && <Polyline positions={props.path} pathOptions={{ className: "sandbox-route" }} />}
      <Layers {...props} />
    </MapContainer>
  );
}
