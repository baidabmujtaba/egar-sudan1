import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";

export default function FavoriteButton({ listingId, className = "", onPhoto = false }: { listingId: string; className?: string; onPhoto?: boolean }) {
  const { isSaved, toggle } = useFavorites();
  const saved = isSaved(listingId);
  return <Button variant={onPhoto ? "photo" : "ghost"} size="icon" className={`favorite-button rounded-full ${onPhoto ? "h-9 w-9 bg-transparent hover:bg-transparent" : `bg-card/95 shadow-sm hover:bg-card ${saved ? "text-primary" : "text-foreground"}`} ${className}`}
    aria-label={saved ? "إزالة من المفضلة" : "حفظ في المفضلة"} aria-pressed={saved}
    onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(listingId); }}>
    <Heart className={`transition-transform ${onPhoto ? `!h-7 !w-7 photo-heart ${saved ? "photo-heart-saved scale-110" : ""}` : `h-5 w-5 ${saved ? "fill-primary scale-110" : "fill-none"}`}`} />
  </Button>;
}