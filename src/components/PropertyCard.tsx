import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, MessageCircle, Video, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const mediaList: { type: "image" | "video"; url: string }[] = [
    ...(video_url ? [{ type: "video" as const, url: video_url }] : []),
    ...(images?.map(i => ({ type: "image" as const, url: i.image_url })) || []),
  ];
  const total = mediaList.length;
  const next = () => setSlide(s => (s + 1) % total);
  const prev = () => setSlide(s => (s - 1 + total) % total);
  const openLightbox = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (total === 0) return;
    setSlide(0);
    setOpen(true);
  };
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
      <div
        className="block cursor-pointer"
        onMouseEnter={() => videoRef.current?.play().catch(() => {})}
        onMouseLeave={() => { if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; } }}
        onClick={openLightbox}
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
        <Link to={`/property/${id}`} onClick={e => e.stopPropagation()} className="block pt-3 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-[15px] line-clamp-1">{title}</h3>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /><span className="line-clamp-1">{location}</span>
          </div>
          <p className="text-sm pt-1"><span className="font-bold text-foreground">{price.toLocaleString()} {currencyLabel}</span> <span className="text-muted-foreground">/ شهري</span></p>
        </Link>
      </div>
      <div className="pt-3 flex gap-2">
        <a href={`tel:${cleanPhone}`} className="flex-1" onClick={e => e.stopPropagation()}>
          <Button variant="outline" size="sm" className="w-full rounded-full"><Phone className="h-4 w-4 ml-1" />اتصال</Button>
        </a>
        <a href={`https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`} target="_blank" rel="noopener noreferrer" className="flex-1" onClick={e => e.stopPropagation()}>
          <Button variant="default" size="sm" className="w-full rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white"><MessageCircle className="h-4 w-4 ml-1" />واتساب</Button>
        </a>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl w-[95vw] p-0 bg-black border-0 overflow-hidden">
          <div className="relative aspect-video bg-black flex items-center justify-center">
            {mediaList[slide]?.type === "video" ? (
              <video src={mediaList[slide].url} controls autoPlay playsInline className="w-full h-full object-contain" />
            ) : (
              <img src={mediaList[slide]?.url} alt={title} className="w-full h-full object-contain" />
            )}
            {total > 1 && (
              <>
                <button onClick={prev} aria-label="السابق" className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-foreground rounded-full p-2 shadow">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={next} aria-label="التالي" className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-foreground rounded-full p-2 shadow">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                  {slide + 1} / {total}
                </div>
              </>
            )}
          </div>
          {total > 1 && (
            <div className="flex gap-2 overflow-x-auto p-3 bg-black">
              {mediaList.map((m, i) => (
                <button key={i} onClick={() => setSlide(i)} className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${i === slide ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}>
                  {m.type === "video" ? (
                    <>
                      <video src={m.url} muted playsInline className="w-full h-full object-cover" />
                      <Video className="absolute inset-0 m-auto h-5 w-5 text-white" />
                    </>
                  ) : (
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between gap-3 p-4 bg-background">
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{title}</h3>
              <p className="text-sm text-muted-foreground truncate">{location} · {price.toLocaleString()} {currencyLabel}</p>
            </div>
            <Link to={`/property/${id}`}>
              <Button size="sm" className="rounded-full">عرض التفاصيل</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
