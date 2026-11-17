import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Images, Phone, MessageCircle, ChevronLeft, ChevronRight, Video, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ListingImage from "@/components/ListingImage";
import FavoriteButton from "@/components/FavoriteButton";
import AdvertiserTag from "@/components/AdvertiserTag";
import { currencyLabel, periodLabel, listingKey, type Listing } from "@/lib/discovery";
import { thumb } from "@/lib/image";

type Props = Omit<Listing, "kind"> & { kind?: Listing["kind"]; compact?: boolean };
export default function PropertyCard(props: Props) {
  const { compact = false, ...listing } = props;
  const item: Listing = { ...listing, kind: props.kind || "property" };
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [contact, setContact] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const media = [...(item.images || []).map(image => ({ type: "image", url: image.image_url })), ...(item.video_url ? [{ type: "video", url: item.video_url }] : [])];
  useEffect(() => {
    if (previewing) videoRef.current?.play().catch(() => setPreviewing(false));
    else videoRef.current?.pause();
  }, [previewing]);
  useEffect(() => {
    if (!previewing || !cardRef.current) return;
    const observer = new IntersectionObserver(entries => { if (!entries[0]?.isIntersecting) setPreviewing(false); });
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [previewing]);
  useEffect(() => {
    if (!open) return;
    let live = true;
    setContact(null);
    setContactLoading(true);
    const table = item.kind === "property" ? "properties" : item.kind === "shared" ? "shared_housing" : "dormitories";
    Promise.resolve(supabase.from(table).select("phone_number").eq("id", item.id).eq("status", "approved").single()).then(({ data, error }) => {
      if (!live) return;
      setContact(error ? null : data?.phone_number || null);
      setContactLoading(false);
    }).catch(() => { if (live) { setContact(null); setContactLoading(false); } });
    return () => { live = false; };
  }, [open, item.id, item.kind]);
  const showHousing = () => setOpen(true);
  const cleanPhone = (contact || "").replace(/\s+/g, "");
  const waPhone = cleanPhone.startsWith("0") ? `249${cleanPhone.slice(1)}` : cleanPhone.replace(/^\+/, "");
  const message = `مرحباً، أستفسر عن ${item.title}\nالموقع: ${item.location}\nالسعر: ${item.price.toLocaleString()} ${currencyLabel(item.currency)}${item.images?.[0] ? `\nصورة: ${item.images[0].image_url}` : ""}`;
  const firstImage = item.images?.[0]?.image_url;
  const content = <><div className={`listing-photo relative overflow-hidden bg-secondary ${compact ? "listing-photo-compact" : "aspect-square"}`}>
    <ListingImage src={firstImage} alt={item.title} className="transition-transform duration-500 group-hover:scale-[1.025]" />
    {item.video_url && !videoFailed && <video ref={videoRef} src={item.video_url} poster={firstImage ? thumb(firstImage) : undefined} muted loop playsInline preload={firstImage ? "none" : "metadata"} onError={() => { setVideoFailed(true); setPreviewing(false); }} className={`absolute inset-0 h-full w-full object-cover ${previewing || !firstImage ? "opacity-100" : "opacity-0"}`} />}
  </div><div className={`pt-2 text-right ${compact ? "space-y-0.5" : "space-y-1"}`}><h3 className={`line-clamp-1 font-semibold ${compact ? "text-[13px] leading-5 md:text-sm" : "text-[15px] leading-6"}`}>{item.title}</h3><p className={`line-clamp-1 text-muted-foreground ${compact ? "text-[11px] leading-[18px] md:text-xs" : "text-[13px]"}`}>{item.location}</p><p className={`flex flex-wrap items-baseline gap-x-1 text-muted-foreground ${compact ? "text-[11px] leading-[18px] md:text-xs" : "text-[13px]"}`}><span className="font-medium">{item.price.toLocaleString()} {currencyLabel(item.currency)}</span><span>/ {periodLabel(item.rental_period)}</span></p>{!compact && <p className="line-clamp-1 text-xs text-muted-foreground">{item.kind === "property" ? item.property_type : `${item.available_spots || 0} أماكن متاحة${item.beds_per_room ? ` · ${item.beds_per_room} أسرّة / غرفة` : ""}`}</p>}</div></>;
  return <article ref={cardRef} className="group relative min-w-0" onMouseEnter={() => { if (item.video_url && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && window.matchMedia("(hover: hover)").matches) setPreviewing(true); }} onMouseLeave={() => setPreviewing(false)}>
    {item.kind === "property" ? <Link to={`/property/${item.id}`} className="block" aria-label={item.title}>{content}</Link> : <Button variant="ghost" onClick={showHousing} className="block h-auto w-full whitespace-normal p-0 hover:bg-transparent">{content}</Button>}
    <FavoriteButton listingId={listingKey(item)} onPhoto className="absolute right-1.5 top-1.5 md:right-2 md:top-2" />
    {media.length > 0 && <Button variant="photo" size="icon" className="absolute left-1.5 top-1.5 h-7 w-7 bg-transparent hover:bg-transparent" aria-label={`عرض صور وفيديو: ${item.title}`} onClick={() => { setPreviewing(false); setSlide(0); setOpen(true); }}><Images className="!h-4 !w-4" /></Button>}
    {item.video_url && !videoFailed && <Button variant="photo" size="icon" className="absolute right-2 top-12 h-7 w-7" aria-label={previewing ? `إيقاف الفيديو: ${item.title}` : `معاينة الفيديو: ${item.title}`} aria-pressed={previewing} onClick={() => setPreviewing(value => !value)}>{previewing ? <Pause /> : <Video />}</Button>}
    {item.advertiser && <AdvertiserTag {...item.advertiser} compact={compact} className={compact ? "mt-0.5" : "mt-2 !bg-transparent !px-0 !ring-0"} />}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="flex max-h-[90dvh] w-[calc(100%-32px)] max-w-4xl flex-col gap-0 overflow-y-auto rounded-2xl p-0 [&>button:last-child]:grid [&>button:last-child]:h-9 [&>button:last-child]:w-9 [&>button:last-child]:place-items-center" dir="rtl">
      <div className="shrink-0 px-6 pb-4 pt-12"><DialogTitle className="leading-7 tracking-normal">{item.title}</DialogTitle><DialogDescription className="mt-1">{item.location}</DialogDescription></div>
      {media.length > 0 && <div className="relative h-[min(46dvh,520px)] w-full shrink-0 bg-muted">{media[slide]?.type === "video" ? <video src={media[slide]?.url} controls autoPlay playsInline className="h-full w-full object-contain" /> : <ListingImage src={media[slide]?.url} alt={item.title} large className="!object-contain" />}
        {media.length > 1 && <><Button variant="secondary" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full" aria-label="الصورة السابقة" onClick={() => setSlide(s => (s - 1 + media.length) % media.length)}><ChevronRight /></Button><Button variant="secondary" size="icon" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full" aria-label="الصورة التالية" onClick={() => setSlide(s => (s + 1) % media.length)}><ChevronLeft /></Button><span dir="ltr" className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-card px-3 py-1 text-xs">{slide + 1} / {media.length}</span></>}
      </div>}
      {media.length > 1 && <div className="scrollbar-none flex shrink-0 gap-2 overflow-x-auto px-5 py-3">{media.map((m, i) => <Button key={m.url} variant="outline" className={`h-14 w-14 shrink-0 overflow-hidden p-0 ${i === slide ? "border-primary" : ""}`} aria-label={`وسائط ${i + 1}`} onClick={() => setSlide(i)}>{m.type === "video" ? <Video /> : <ListingImage src={m.url} alt="" />}</Button>)}</div>}
      <div className="shrink-0 space-y-4 p-6"><p><strong>{item.price.toLocaleString()} {currencyLabel(item.currency)}</strong> / {periodLabel(item.rental_period)}</p>
        {item.kind === "property" ? <Button asChild className="rounded-xl"><Link to={`/property/${item.id}`}>عرض التفاصيل</Link></Button> : <><p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{item.description}</p><div className="flex flex-wrap gap-2 text-sm"><span>{item.available_spots} أماكن متاحة</span>{item.nearby_university && <span>· {item.nearby_university}</span>}{item.meals_included && <span>· وجبات مشمولة</span>}{item.gender && <span>· {item.gender === "male" ? "ذكور" : item.gender === "female" ? "إناث" : "مختلط"}</span>}</div>{item.advertiser && <AdvertiserTag {...item.advertiser} />}</>}
        {contactLoading ? <p className="text-sm text-muted-foreground" role="status">جاري تحميل رقم التواصل...</p> : cleanPhone ? <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline"><a href={`tel:${cleanPhone}`} onClick={() => {
            window.__lovableEvents?.track?.("project.advertiser_contact_clicked", { channel: "phone", source: "card", listing_kind: item.kind, viewer_role: user ? profile?.role || "unknown" : "visitor" });
          }}><Phone />اتصال</a></Button>
          <Button asChild><a href={`https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" onClick={() => {
            window.__lovableEvents?.track?.("project.advertiser_contact_clicked", { channel: "whatsapp", source: "card", listing_kind: item.kind, viewer_role: user ? profile?.role || "unknown" : "visitor" });
          }}><MessageCircle />واتساب</a></Button>
        </div> : <p className="text-sm text-muted-foreground">رقم التواصل غير متاح</p>}
      </div>
    </DialogContent></Dialog>
  </article>;
}
