import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, MessageCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const propertyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/property/${id}`;
  // Include image URL in message so WhatsApp shows a rich preview
  const waMessage = [
    `مرحباً، أستفسر عن العقار: ${title}`,
    `السعر: ${price.toLocaleString()} ${currencyLabel}`,
    `الموقع: ${location}`,
    firstImage ? `صورة: ${firstImage}` : null,
    `رابط العقار: ${propertyUrl}`,
  ].filter(Boolean).join("\n");

  return (
    <div className="group animate-fade-in">
      <Link
        to={`/property/${id}`}
        className="block"
        onMouseEnter={() => videoRef.current?.play().catch(() => {})}
        onMouseLeave={() => { if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; } }}
      >
        <div className="aspect-square sm:aspect-[4/5] bg-muted relative overflow-hidden rounded-2xl">
          {firstImage ? (
            <img src={firstImage} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">لا توجد صورة</div>
          )}
          {video_url && (
            <video
              ref={videoRef}
              src={video_url}
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          )}
          <Badge className="absolute top-3 right-3 bg-background/95 text-foreground hover:bg-background border-0 shadow">{property_type}</Badge>
          {video_url && (
            <Badge className="absolute top-3 left-3 bg-foreground/85 text-background border-0 gap-1 backdrop-blur">
              <Video className="h-3 w-3" /> فيديو
            </Badge>
          )}
        </div>
        <div className="pt-3 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-[15px] line-clamp-1">{title}</h3>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /><span className="line-clamp-1">{location}</span>
          </div>
          <p className="text-sm pt-1"><span className="font-bold text-foreground">{price.toLocaleString()} {currencyLabel}</span> <span className="text-muted-foreground">/ شهري</span></p>
        </div>
      </Link>
      <div className="pt-3 flex gap-2">
        <a href={`tel:${cleanPhone}`} className="flex-1" onClick={e => e.stopPropagation()}>
          <Button variant="outline" size="sm" className="w-full rounded-full"><Phone className="h-4 w-4 ml-1" />اتصال</Button>
        </a>
        <a href={`https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`} target="_blank" rel="noopener noreferrer" className="flex-1" onClick={e => e.stopPropagation()}>
          <Button variant="default" size="sm" className="w-full rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white"><MessageCircle className="h-4 w-4 ml-1" />واتساب</Button>
        </a>
      </div>
    </div>
  );
}
