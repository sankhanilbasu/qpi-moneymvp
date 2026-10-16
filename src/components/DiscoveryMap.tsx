import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import L from "leaflet";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Crosshair, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "./CategoryIcon";
import { categories, type DiscoveryProducer } from "@/lib/discovery";

interface MapProps { producers: DiscoveryProducer[]; selectedId: string | null; onSelect: (id: string) => void }
const center: [number, number] = [51.52, -0.077];

function MapContents({ producers, selectedId, onSelect }: MapProps) {
  const map = useMap();
  useEffect(() => {
    const roots: ReturnType<typeof createRoot>[] = [];
    const markers = producers.map(producer => {
      const selected = producer.id === selectedId;
      const host = document.createElement("div");
      const root = createRoot(host); roots.push(root);
      const category = categories.find(c => c.id === producer.category);
      root.render(<Button variant="ghost" size="icon" className={`merchant-pin merchant-${producer.category} ${selected ? "merchant-selected" : ""}`} aria-label={`${producer.name} map pin`} aria-pressed={selected} title={`${producer.name} · ${category?.label} · MCC ${category?.mcc}`} onClick={() => onSelect(producer.id)}><CategoryIcon category={producer.category} className="h-5 w-5" /></Button>);
      return L.marker(producer.position, { icon: L.divIcon({ html: host, className: "merchant-marker-host", iconSize: [44,44], iconAnchor: [22,22] }), keyboard: false, zIndexOffset: selected ? 1000 : 0 }).addTo(map);
    });
    return () => { markers.forEach(marker => marker.remove()); roots.forEach(root => { queueMicrotask(() => root.unmount()); }); };
  }, [map, producers, selectedId, onSelect]);
  useEffect(() => {
    const selected = producers.find(p => p.id === selectedId);
    if (selected) map.panTo(selected.position, { animate: false });
  }, [map, producers, selectedId]);
  return <div className="map-controls"><Button variant="outline" size="icon" aria-label="Zoom in" title="Zoom in" onClick={() => map.zoomIn()}><Plus /></Button><Button variant="outline" size="icon" aria-label="Zoom out" title="Zoom out" onClick={() => map.zoomOut()}><Minus /></Button><Button variant="outline" size="icon" aria-label="Recenter map" title="Recenter map" onClick={() => map.setView(center,14)}><Crosshair /></Button></div>;
}

export default function DiscoveryMap(props: MapProps) {
  return <MapContainer center={center} zoom={14} minZoom={11} maxZoom={18} zoomControl={false} className="discovery-leaflet" attributionControl scrollWheelZoom><TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution={'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'} /><MapContents {...props} /></MapContainer>;
}