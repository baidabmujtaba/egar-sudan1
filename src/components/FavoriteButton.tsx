import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";

export default function FavoriteButton({ listingId, className = "" }: { listingId: string; className?: string }) {
  const { isSaved, toggle } = useFavorites();
  const saved = isSaved(listingId);
  return <Button variant="ghost" size="icon" className={`favorite-button rounded-full bg-card/95 shadow-sm hover:bg-card ${saved ? "text-primary" : "text-foreground"} ${className}`}
    aria-label={saved ? "إزالة من المفضلة" : "حفظ في المفضلة"} aria-pressed={saved}
    onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(listingId); }}>
    <Heart className={`h-5 w-5 transition-transform ${saved ? "fill-primary scale-110" : "fill-none"}`} />
  </Button>;
}