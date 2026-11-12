import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Images, Phone, MessageCircle, ChevronLeft, ChevronRight, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ListingImage from "@/components/ListingImage";
import FavoriteButton from "@/components/FavoriteButton";
import AdvertiserTag from "@/components/AdvertiserTag";
import { currencyLabel, periodLabel, listingKey, type Listing } from "@/lib/discovery";

type Props = Omit<Listing, "kind"> & { kind?: Listing["kind"] };
export default function PropertyCard(props: Props) {
  const item: Listing = { ...props, kind: props.kind || "property" };
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [contact, setContact] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const media = [...(item.images || []).map(image => ({ type: "image", url: image.image_url })), ...(item.video_url ? [{ type: "video", url: item.video_url }] : [])];
  useEffect(() => {
    if (!item.video_url || !cardRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) videoRef.current?.play().catch(() => undefined);
      else videoRef.current?.pause();
    }, { threshold: .6 });
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [item.video_url]);
  useEffect(() => {
    if (!open || !user || item.kind === "property") return;
    let live = true;
    const table = item.kind === "shared" ? "shared_housing" : "dormitories";
    supabase.from(table).select("phone_number").eq("id", item.id).single().then(({ data }) => { if (live) setContact(data?.phone_number || null); });
    return () => { live = false; };
  }, [open, user, item.id, item.kind]);
  const showHousing = () => { if (!user) { navigate("/login"); return; } setOpen(true); };
  const cleanPhone = (contact || "").replace(/\s+/g, "");
  const waPhone = cleanPhone.startsWith("0") ? `249${cleanPhone.slice(1)}` : cleanPhone.replace(/^\+/, "");
  const message = `مرحباً، أستفسر عن ${item.title}\nالموقع: ${item.location}\nالسعر: ${item.price.toLocaleString()} ${currencyLabel(item.currency)}${item.images?.[0] ? `\nصورة: ${item.images[0].image_url}` : ""}`;
  const content = <><div className="aspect-square overflow-hidden rounded-[24px] bg-secondary">
    {item.video_url ? <video ref={videoRef} src={item.video_url} poster={item.images?.[0]?.image_url} muted loop playsInline preload="metadata" className="h-full w-full object-cover" /> : <ListingImage src={item.images?.[0]?.image_url} alt={item.title} className="transition-transform duration-500 group-hover:scale-[1.025]" />}
  </div><div className="space-y-1.5 pt-3 text-right"><h3 className="line-clamp-1 text-[15px] font-bold leading-6">{item.title}</h3><p className="line-clamp-1 text-[13px] text-muted-foreground">{item.location}</p><p className="text-[13px]"><strong className="text-[14px] font-bold">{item.price.toLocaleString()} {currencyLabel(item.currency)}</strong><span className="text-muted-foreground"> / {periodLabel(item.rental_period)}</span></p><p className="line-clamp-1 text-xs text-muted-foreground">{item.kind === "property" ? item.property_type : `${item.available_spots || 0} أماكن متاحة${item.beds_per_room ? ` · ${item.beds_per_room} أسرّة / غرفة` : ""}`}</p></div></>;
  return <article ref={cardRef} className="group relative min-w-0">
    {item.kind === "property" ? <Link to={`/property/${item.id}`} className="block" aria-label={item.title}>{content}</Link> : <Button variant="ghost" onClick={showHousing} className="block h-auto w-full whitespace-normal p-0 hover:bg-transparent">{content}</Button>}
    <FavoriteButton listingId={listingKey(item)} className="absolute right-3 top-3" />
    {item.kind !== "property" && <span className="absolute left-3 top-3 rounded-full bg-card/95 px-3 py-1 text-[11px] font-semibold shadow-sm">{item.property_type}</span>}
    {media.length > 0 && <Button variant="ghost" size="icon" className="absolute left-3 top-[calc(100cqw-52px)] hidden" aria-label="المعرض" onClick={() => setOpen(true)}><Images /></Button>}
    {media.length > 0 && <Button variant="secondary" size="sm" className="absolute left-3 top-3 h-8 rounded-full px-2 shadow-sm" aria-label={`عرض صور وفيديو: ${item.title}`} onClick={() => { setSlide(0); setOpen(true); }}>{item.video_url ? <Video /> : <Images />}{media.length}</Button>}
    {item.advertiser && <AdvertiserTag {...item.advertiser} className="mt-2 !bg-transparent !px-0 !ring-0" />}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90dvh] w-[calc(100%-32px)] max-w-4xl overflow-y-auto rounded-2xl p-0" dir="rtl">
      <div className="px-6 pb-3 pt-12"><DialogTitle className="tracking-normal">{item.title}</DialogTitle><DialogDescription className="mt-2">{item.location}</DialogDescription></div>
      {media.length > 0 && <div className="relative aspect-square bg-muted sm:aspect-video">{media[slide]?.type === "video" ? <video src={media[slide]?.url} controls autoPlay playsInline className="h-full w-full object-contain" /> : <ListingImage src={media[slide]?.url} alt={item.title} large className="!object-contain" />}
        {media.length > 1 && <><Button variant="secondary" size="icon" className="absolute right-3 top-1/2 rounded-full" aria-label="الصورة السابقة" onClick={() => setSlide(s => (s - 1 + media.length) % media.length)}><ChevronRight /></Button><Button variant="secondary" size="icon" className="absolute left-3 top-1/2 rounded-full" aria-label="الصورة التالية" onClick={() => setSlide(s => (s + 1) % media.length)}><ChevronLeft /></Button><span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-card px-3 py-1 text-xs">{slide + 1} / {media.length}</span></>}
      </div>}
      {media.length > 1 && <div className="flex gap-2 overflow-x-auto px-5">{media.map((m, i) => <Button key={m.url} variant="outline" className={`h-14 w-14 shrink-0 overflow-hidden p-0 ${i === slide ? "border-primary" : ""}`} aria-label={`وسائط ${i + 1}`} onClick={() => setSlide(i)}>{m.type === "video" ? <Video /> : <ListingImage src={m.url} alt="" />}</Button>)}</div>}
      <div className="space-y-4 p-6"><p><strong>{item.price.toLocaleString()} {currencyLabel(item.currency)}</strong> / {periodLabel(item.rental_period)}</p>
        {item.kind === "property" ? <Button asChild className="rounded-xl"><Link to={`/property/${item.id}`}>عرض التفاصيل</Link></Button> : <><p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{item.description}</p><div className="flex flex-wrap gap-2 text-sm"><span>{item.available_spots} أماكن متاحة</span>{item.nearby_university && <span>· {item.nearby_university}</span>}{item.meals_included && <span>· وجبات مشمولة</span>}{item.gender && <span>· {item.gender === "male" ? "ذكور" : item.gender === "female" ? "إناث" : "مختلط"}</span>}</div>{item.advertiser && <AdvertiserTag {...item.advertiser} />}{user ? <div className="flex gap-3"><Button asChild variant="outline" disabled={!contact}><a href={`tel:${cleanPhone}`}><Phone />اتصال</a></Button><Button asChild disabled={!contact}><a href={`https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer"><MessageCircle />واتساب</a></Button></div> : <Button asChild><Link to="/login">تسجيل الدخول للتواصل</Link></Button>}</>}
      </div>
    </DialogContent></Dialog>
  </article>;
}
