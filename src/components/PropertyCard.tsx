import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, MessageCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  property_type: string;
  phone_number: string;
  currency?: string;
  video_url?: string | null;
  images?: { image_url: string }[];
}

export default function PropertyCard({ id, title, price, location, property_type, phone_number, currency, video_url, images }: PropertyCardProps) {
  const firstImage = images?.[0]?.image_url;
  const currencyLabel = currency === "USD" ? "$" : "ج.س";
  const cleanPhone = phone_number.replace(/\s+/g, "");
  const waPhone = cleanPhone.startsWith("0") ? "249" + cleanPhone.slice(1) : cleanPhone;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in">
      <Link to={`/property/${id}`}>
        <div className="aspect-video bg-muted relative overflow-hidden">
          {firstImage ? (
            <img src={firstImage} alt={title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">لا توجد صورة</div>
          )}
          <Badge className="absolute top-2 right-2">{property_type}</Badge>
          {video_url && (
            <Badge className="absolute top-2 left-2 bg-foreground/80 text-background border-0 gap-1">
              <Video className="h-3 w-3" /> فيديو
            </Badge>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-bold text-lg line-clamp-1">{title}</h3>
          <p className="text-2xl font-bold text-primary">{price.toLocaleString()} {currencyLabel}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" /><span>{location}</span>
          </div>
        </CardContent>
      </Link>
      <div className="px-4 pb-4 flex gap-2">
        <a href={`tel:${cleanPhone}`} className="flex-1" onClick={e => e.stopPropagation()}>
          <Button variant="outline" size="sm" className="w-full"><Phone className="h-4 w-4 ml-1" />اتصال</Button>
        </a>
        <a href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`مرحباً، أستفسر عن العقار: ${title}\nالسعر: ${price.toLocaleString()} ج.س\nالموقع: ${location}\n\nرابط العقار: ${window.location.origin}/property/${id}`)}`} target="_blank" rel="noopener noreferrer" className="flex-1" onClick={e => e.stopPropagation()}>
          <Button variant="default" size="sm" className="w-full"><MessageCircle className="h-4 w-4 ml-1" />واتساب</Button>
        </a>
      </div>
    </Card>
  );
}
