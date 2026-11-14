import { useEffect, useState } from "react";
import { useParams, Navigate, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Phone, MessageCircle, Headphones, ChevronLeft, ChevronRight, Images, Video, ArrowRight } from "lucide-react";
import ListingImage from "@/components/ListingImage";
import FavoriteButton from "@/components/FavoriteButton";
import AdvertiserTag from "@/components/AdvertiserTag";
import DiscoverySection from "@/components/DiscoverySection";
import { useDiscovery } from "@/hooks/use-discovery";
import { currencyLabel, periodLabel } from "@/lib/discovery";

const SUPPORT_PHONE = "249116458724";
export default function PropertyDetails() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [activeImage, setActiveImage] = useState(0);
  const [gallery, setGallery] = useState(false);
  useEffect(() => { setActiveImage(0); setGallery(false); window.scrollTo(0,0); }, [id]);
  const { data: property, isLoading, isError, refetch } = useQuery({ queryKey: ["property-detail", id, user?.id], enabled: Boolean(user && id), queryFn: async () => {
    if (!id || !user) return null;
    const { data, error } = await supabase.from("properties").select("*, property_images(image_url)").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  } });
  const { data: listings = [] } = useDiscovery();
  if (authLoading) return <div className="min-h-screen"><Navbar /><div className="container py-8"><div className="aspect-video animate-pulse rounded-[24px] bg-secondary" /></div></div>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (isLoading) return <div className="min-h-screen"><Navbar /><div className="container py-8"><div className="aspect-video animate-pulse rounded-[24px] bg-secondary" /></div></div>;
  if (isError) return <div><Navbar /><div className="container py-16 text-center"><p className="mb-5">تعذر تحميل العقار</p><Button onClick={() => refetch()}>إعادة المحاولة</Button></div></div>;
  if (!property) return <div><Navbar /><div className="container py-16 text-center"><h1 className="mb-5 text-xl font-bold">العقار غير موجود</h1><Button asChild variant="outline"><Link to="/">العودة للتصفح</Link></Button></div></div>;
  const media = [...property.property_images.map(image => ({type: "image",url: image.image_url})), ...(property.video_url ? [{type:"video",url:property.video_url}] : [])];
  const cleanPhone = (property.phone_number || "").replace(/\s+/g, "");
  const waPhone = cleanPhone.startsWith("0") ? "249" + cleanPhone.slice(1) : cleanPhone.replace(/^\+/, "");
  const advertiser = listings.find(p => p.id === id)?.advertiser;
  const similar = listings.filter(p => p.kind === "property" && p.id !== id && p.property_type === property.property_type);
  const waMessage = `مرحباً، أستفسر عن العقار: ${property.title}\nالسعر: ${property.price.toLocaleString()} ${currencyLabel(property.currency)} / ${periodLabel(property.rental_period)}\nالموقع: ${property.location}${property.property_images[0] ? `\nالصورة: ${property.property_images[0].image_url}` : ""}\nرابط العقار: ${window.location.href}`;
  const next = () => setActiveImage(i => (i+1)%media.length);
  const prev = () => setActiveImage(i => (i-1+media.length)%media.length);
  return <div className="min-h-screen bg-background"><Navbar /><main className="container max-w-6xl pb-10 pt-5 md:pt-8">
    <div className="mb-4 flex items-center justify-between"><Button asChild variant="ghost" className="rounded-full"><Link to="/"><ArrowRight />العودة</Link></Button><FavoriteButton listingId={`property:${property.id}`} /></div>
    {media.length > 0 && <div className="relative overflow-hidden rounded-[24px] bg-secondary"><div className="aspect-square md:aspect-[16/9]">
      {media[activeImage]?.type === "video" ? <video src={media[activeImage]?.url} controls playsInline className="h-full w-full object-contain" /> : <ListingImage src={media[activeImage]?.url} alt={property.title} large />}
      </div><Button variant="secondary" className="absolute bottom-4 left-4 rounded-full shadow-sm" onClick={() => setGallery(true)}><Images />{media.length} وسائط</Button>
      {media.length > 1 && <><Button size="icon" variant="secondary" className="absolute right-3 top-1/2 rounded-full shadow-sm" onClick={prev} aria-label="الصورة السابقة"><ChevronRight /></Button><Button size="icon" variant="secondary" className="absolute left-3 top-1/2 rounded-full shadow-sm" onClick={next} aria-label="الصورة التالية"><ChevronLeft /></Button></>}
    </div>}
    {media.length > 1 && <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto">{media.map((image,i) => <Button variant="outline" key={image.url} onClick={() => setActiveImage(i)} aria-label={`وسائط العقار ${i+1}`} aria-pressed={i === activeImage} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg p-0 ${activeImage === i ? "border-2 border-primary" : "border-transparent"}`}>{image.type === "video" ? <Video /> : <ListingImage src={image.url} alt="" />}</Button>)}</div>}
    <div className="grid gap-8 pt-7 md:grid-cols-[minmax(0,1fr)_340px] md:gap-12"><div className="min-w-0"><span className="text-sm font-semibold text-primary">{property.property_type}</span><h1 className="mt-2 text-2xl font-bold leading-relaxed md:text-3xl">{property.title}</h1><p className="mt-3 flex items-start gap-2 text-sm leading-6 text-muted-foreground"><MapPin className="mt-1 h-4 w-4 shrink-0" />{property.location}</p>
      {advertiser && <div className="mt-6 border-y py-5"><h2 className="mb-3 text-base font-bold">المعلن</h2><AdvertiserTag {...advertiser} className="!max-w-md !rounded-none !bg-transparent !px-0 !ring-0" /></div>}
      {property.description && <section className="py-6"><h2 className="mb-3 text-lg font-bold">عن العقار</h2><p className="whitespace-pre-line text-sm leading-8 text-muted-foreground">{property.description}</p></section>}
      <div className="border-t pt-5"><h2 className="mb-3 font-bold">الدعم</h2><div className="flex flex-wrap gap-2"><Button asChild variant="ghost" size="sm"><a href={`tel:+${SUPPORT_PHONE}`}><Headphones />اتصال بالدعم</a></Button><Button asChild variant="ghost" size="sm"><a href={`https://wa.me/${SUPPORT_PHONE}`} target="_blank" rel="noopener noreferrer"><MessageCircle />واتساب الدعم</a></Button></div></div>
    </div><aside className="self-start rounded-2xl border bg-card p-6 shadow-sm md:sticky md:top-6"><p className="text-2xl font-bold">{property.price.toLocaleString()} <span className="text-base">{currencyLabel(property.currency)}</span></p><p className="mt-1 text-sm text-muted-foreground">/ {periodLabel(property.rental_period)}</p><div className="mt-6 space-y-3">{cleanPhone ? <><Button asChild className="h-12 w-full rounded-xl"><a href={`tel:${cleanPhone}`}><Phone />اتصال بالمعلن</a></Button><Button asChild variant="outline" className="h-12 w-full rounded-xl"><a href={`https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`} target="_blank" rel="noopener noreferrer"><MessageCircle />واتساب المعلن</a></Button></> : <p className="text-sm text-muted-foreground">رقم التواصل غير متاح</p>}</div></aside></div>
    {similar.length > 0 && <div className="mt-10 border-t pt-8"><DiscoverySection title="عقارات مشابهة" items={similar} /></div>}
    <Dialog open={gallery} onOpenChange={setGallery}><DialogContent className="w-[calc(100%-24px)] max-w-5xl rounded-2xl p-4" dir="rtl"><DialogTitle className="pr-6 tracking-normal">{property.title}</DialogTitle><DialogDescription className="sr-only">معرض الصور والفيديو</DialogDescription><div className="relative aspect-square bg-secondary sm:aspect-video">{media[activeImage]?.type === "video" ? <video src={media[activeImage]?.url} controls playsInline className="h-full w-full object-contain" /> : <ListingImage src={media[activeImage]?.url} alt={property.title} large className="!object-contain" />}{media.length > 1 && <><Button variant="secondary" size="icon" className="absolute right-2 top-1/2 rounded-full" onClick={prev} aria-label="السابق"><ChevronRight /></Button><Button variant="secondary" size="icon" className="absolute left-2 top-1/2 rounded-full" onClick={next} aria-label="التالي"><ChevronLeft /></Button></>}</div><p className="text-center text-sm text-muted-foreground">{activeImage+1} / {media.length}</p></DialogContent></Dialog>
  </main></div>;
}
