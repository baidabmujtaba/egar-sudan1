import { useState } from "react";
import { Home } from "lucide-react";
import { thumb, thumbSrcSet } from "@/lib/image";

export default function ListingImage({ src, alt, large = false, className = "" }: { src?: string; alt: string; large?: boolean; className?: string }) {
  const [fallback, setFallback] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className={`grid h-full w-full place-items-center bg-secondary text-muted-foreground ${className}`}><Home className="h-12 w-12" aria-label="لا توجد صورة" /></div>;
  return <img src={fallback ? src : thumb(src, { width: large ? 1600 : 720, quality: large ? 85 : 80 })}
    srcSet={fallback ? undefined : thumbSrcSet(src, large ? [640, 960, 1280, 1600] : [320, 480, 640, 960]) || undefined}
    sizes={large ? "(max-width: 768px) 100vw, 1100px" : "(max-width: 768px) 310px, 280px"}
    onError={() => fallback ? setFailed(true) : setFallback(true)} alt={alt} loading={large ? "eager" : "lazy"} decoding="async"
    className={`h-full w-full object-cover ${className}`} />;
}