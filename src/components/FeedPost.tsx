import { forwardRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, Heart, MapPin, MessageCircle } from "lucide-react";
import { TrustRing } from "./TrustRing";
import { Button } from "./ui/button";
import { categories, formatPrice, liveStatus, type DiscoveryProducer } from "@/lib/discovery";
import { discoveryAvatars } from "@/lib/discovery-avatars";
import { discoveryVideos } from "@/lib/discovery-videos";
import { openThread, toggleLike } from "@/lib/sandbox-store";

export const FeedPost = forwardRef<HTMLElement, { producer: DiscoveryProducer; liked: boolean; selected: boolean }>(function FeedPost({ producer, liked, selected }, ref) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const category = categories.find(c => c.id === producer.category);
  const own = producer.kind === "own";
  const { live, viewers } = liveStatus(producer.id, Date.now());
  const avatar = discoveryAvatars[producer.id];
  const photos = [...producer.offers.map(o => o.photo).filter((p): p is string => !!p), ...(avatar ? [avatar] : [])];
  function message() { navigate({ to: "/chat/$id", params: { id: openThread(producer.id, producer.name) } }); }
  return (
    <article ref={ref} aria-label={`${producer.name} post`} className={`border-b border-border pb-4 ${selected ? "bg-accent/40" : ""}`}>
      <header className="flex items-center gap-3 px-4 py-3">
        <div className="w-20 shrink-0"><TrustRing name={producer.name} initials={producer.initials} input={producer.trust} avatar={avatar ?? photos[0]} /></div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{producer.name}</p>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{own ? "Your storefront" : `${category?.label} · ${producer.distance}`}</p>
        </div>
        {live && <span className="flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold"><span className="live-dot" />Live</span>}
      </header>
      <div className="relative bg-muted">
        {discoveryVideos[producer.id] ? <video src={discoveryVideos[producer.id]} poster={avatar} className="aspect-square w-full object-cover" autoPlay muted loop playsInline preload="metadata" aria-label={`${producer.name} storefront video (AI-generated)`} />
          : photos.length ? <div className="feed-photos">{photos.map((src, i) => <img key={i} src={src} alt={`${producer.name} photo ${i + 1}`} loading="lazy" />)}</div>
          : <div className="grid aspect-square place-items-center text-4xl font-semibold text-muted-foreground">{producer.initials}</div>}
        {live && <div className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium backdrop-blur"><Eye className="mr-1 inline h-3 w-3" />Live view · {viewers} watching · Open now <span className="text-muted-foreground">(demo)</span></div>}
        {!discoveryVideos[producer.id] && photos.length > 1 && <div className="absolute right-3 top-3 rounded-full bg-background/85 px-2 py-0.5 text-[11px]">{photos.length} photos</div>}
      </div>
      <div className="flex items-center gap-1 px-2 pt-2">
        <Button variant="ghost" size="icon" aria-label={liked ? "Unlike" : "Like"} aria-pressed={liked} onClick={() => toggleLike(producer.id)}><Heart className={liked ? "fill-primary text-primary" : ""} /></Button>
        {!own && <Button variant="ghost" size="icon" aria-label={`Message ${producer.name}`} onClick={message}><MessageCircle /></Button>}
        <Button asChild size="sm" className="ml-auto mr-2 rounded-full"><Link to="/offer/$id" params={{ id: producer.id }}>{own ? "View your storefront" : "View offers"}</Link></Button>
      </div>
      <div className="px-4 text-sm">
        <p className={expanded ? "" : "line-clamp-2"}><span className="font-semibold">{producer.name}</span> {producer.description}</p>
        {!expanded && <button className="text-xs text-muted-foreground" onClick={() => setExpanded(true)}>more</button>}
        <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">{producer.offers.map(o => <li key={o.id}>{o.name} · <span className="font-semibold text-primary">{formatPrice(o.price)}</span></li>)}</ul>
        {producer.kind === "demo" && <p className="mt-1 text-[10px] text-muted-foreground">Demo listing</p>}
      </div>
    </article>
  );
});
