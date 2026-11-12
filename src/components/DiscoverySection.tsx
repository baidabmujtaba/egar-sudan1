import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/discovery";

export default function DiscoverySection({ title, items }: { title: string; items: Listing[] }) {
  const ref = useRef<HTMLDivElement>(null);
  if (!items.length) return null;
  const scroll = (direction: number) => ref.current?.scrollBy({ left: direction * (ref.current.clientWidth * .85), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  return <section className="discovery-section" aria-label={title}>
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold leading-relaxed md:text-xl">{title}</h2>
      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="icon" className="hidden h-8 w-8 rounded-full md:inline-flex" aria-label={`السابق: ${title}`} onClick={() => scroll(1)}><ChevronRight /></Button>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" aria-label={`التالي: ${title}`} onClick={() => scroll(-1)}><ChevronLeft /></Button>
      </div>
    </div>
    <div ref={ref} className="discovery-track scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:gap-5">
      {items.map(item => <div className="discovery-item min-w-0 shrink-0 snap-start" key={`${item.kind}:${item.id}`}><PropertyCard {...item} /></div>)}
    </div>
  </section>;
}