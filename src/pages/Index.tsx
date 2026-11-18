import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DiscoverySearch from "@/components/DiscoverySearch";
import DiscoverySection from "@/components/DiscoverySection";
import DiscoveryCategories from "@/components/DiscoveryCategories";
import PropertyCard from "@/components/PropertyCard";
import { useDiscovery } from "@/hooks/use-discovery";
import { emptyFilters, matchesListing, type DiscoveryFilters, type Listing } from "@/lib/discovery";

export default function Index({ mode = "all" }: { mode?: "all" | "property" | "shared" | "dormitory" }) {
  const { data: listings = [], isLoading, isError, refetch } = useDiscovery();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const filters: DiscoveryFilters = { ...emptyFilters, location: params.get("loc") || "", type: params.get("cat") || "all", min: params.get("min") || "", max: params.get("max") || "", currency: params.get("currency") || "SDG", gender: params.get("gender") || "all", meals: params.get("meals") || "all", query: params.get("q") || "" };
  const apply = (next: DiscoveryFilters, target?: string) => { const p = new URLSearchParams(); if (next.location) p.set("loc", next.location); if (next.type !== "all") p.set("cat", next.type); if (next.min) p.set("min", next.min); if (next.max) p.set("max", next.max); if (next.min || next.max) p.set("currency", next.currency); if (next.gender !== "all") p.set("gender", next.gender); if (next.meals !== "all") p.set("meals", next.meals); if (next.query) p.set("q", next.query); if (target) navigate({ pathname: target, search: p.toString() }); else setParams(p); };
  const filtered = useMemo(() => listings.filter(p => (mode === "all" || p.kind === mode) && matchesListing(p, filters)), [listings, mode, params]);
  const [visible, setVisible] = useState(24);
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => setVisible(24), [params, mode]);
  useEffect(() => {
    if (!sentinel.current || visible >= filtered.length) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) setVisible(v => v + 24);
    }, { rootMargin: "300px" });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [visible, filtered.length]);
  const locations = [...new Set(listings.map(p => p.location))];
  const active = filters.type !== "all" || filters.location || filters.min || filters.max || filters.query || filters.gender !== "all" || filters.meals !== "all";
  const home = mode === "all" && !active;
  const properties = filtered.filter(p => p.kind === "property");
  const apartments = properties.filter(p => p.property_type === "شقة");
  const omdurman = properties.filter(p => p.location.includes("أم درمان"));
  const budget = properties.filter(p => (p.currency || "SDG") === "SDG").sort((a,b) => a.price - b.price);
  const sections: { title: string; items: Listing[] }[] = [
    { title: "شقق للإيجار", items: apartments }, { title: "أحدث العقارات المضافة", items: properties },
    { title: "شواغر السكن المشترك", items: filtered.filter(p => p.kind === "shared") }, { title: "إيجارات في أم درمان", items: omdurman },
    { title: "خيارات مناسبة للميزانية", items: budget.slice(0, 12) }, { title: "الداخليات الطلابية", items: filtered.filter(p => p.kind === "dormitory") },
  ];
  const title = mode === "shared" ? "السكن المشترك" : mode === "dormitory" ? "الداخليات الطلابية" : mode === "property" ? "كل العقارات" : "نتائج البحث";
  return <div className="discovery-page min-h-screen"><Navbar browsing />
    <div className="discovery-header sticky top-0 z-30 backdrop-blur-md md:border-b">
      <div className="discovery-container flex justify-center pb-3 pt-3 md:pb-5 md:pt-6"><DiscoverySearch filters={filters} onApply={next => apply(next, mode !== "all" && next.type !== "all" && next.type !== mode ? "/" : undefined)} locations={locations} /></div>
      <div className="discovery-container pb-1"><DiscoveryCategories value={filters.type === "all" && mode !== "all" ? mode : filters.type} onChange={type => apply({ ...filters, type, gender: "all", meals: "all" }, mode === "all" ? undefined : "/")} /></div>
    </div>
    <main className="discovery-container pb-8 pt-3 md:pt-8">
      {mode !== "all" && <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">{title}</h1><Button asChild variant="outline" className="rounded-full"><Link to={mode === "dormitory" ? "/add-dormitory" : mode === "shared" ? "/add-shared" : "/add-property"}>إضافة {mode === "dormitory" ? "داخلية" : mode === "shared" ? "شاغر" : "عقار"}</Link></Button></div>}
      {(mode === "shared" || mode === "dormitory") && <div className="mb-6 flex flex-wrap gap-3"><Input aria-label="ابحث بالاسم أو الجامعة" placeholder="ابحث بالاسم أو الموقع" value={filters.query} onChange={e => apply({...filters, query:e.target.value})} className="h-11 max-w-sm rounded-full" /><select aria-label="الجنس" className="h-11 rounded-full border bg-card px-4 text-sm" value={filters.gender} onChange={e => apply({...filters,gender:e.target.value})}><option value="all">الكل</option><option value="male">ذكور</option><option value="female">إناث</option><option value="mixed">مختلط</option></select>{mode === "dormitory" && <select aria-label="الوجبات" className="h-11 rounded-full border bg-card px-4 text-sm" value={filters.meals} onChange={e => apply({...filters,meals:e.target.value})}><option value="all">كل الوجبات</option><option value="yes">وجبات مشمولة</option><option value="no">بدون وجبات</option></select>}</div>}
      {isLoading ? <div className="space-y-8" aria-label="جاري تحميل العقارات">{[0,1].map(row => <div key={row}><div className="mb-4 h-6 w-52 animate-pulse rounded bg-muted" /><div className="discovery-track scrollbar-none flex gap-3 overflow-hidden md:gap-5">{[0,1,2,3].map(i => <div key={i} className="discovery-item shrink-0"><div className="listing-photo listing-photo-compact animate-pulse bg-secondary" /><div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-muted" /><div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-muted" /></div>)}</div></div>)}</div> : isError ? <div className="py-16 text-center"><p className="mb-4">تعذر تحميل الإعلانات</p><Button variant="outline" onClick={() => refetch()}>إعادة المحاولة</Button></div> : filtered.length === 0 ? <div className="py-16 text-center"><Search className="mx-auto mb-4 h-8 w-8 text-muted-foreground" /><h2 className="mb-3 text-lg font-bold">لا توجد إعلانات مطابقة</h2><Button variant="outline" className="rounded-full" onClick={() => apply(emptyFilters)}>مسح الفلاتر</Button></div> : home ? <div className="space-y-8 md:space-y-11">{sections.map(section => <DiscoverySection key={section.title} {...section} />)}<div className="border-t pt-7"><Button asChild variant="outline" className="rounded-full"><Link to="/properties">استكشف كل العقارات<ArrowLeft /></Link></Button></div></div> : <><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">{mode === "all" ? title : `${filtered.length} إعلان`}</h2>{active && <Button variant="link" onClick={() => apply(emptyFilters)}>مسح الفلاتر</Button>}</div><div className="grid grid-cols-2 gap-x-3 gap-y-7 md:gap-x-5 lg:grid-cols-3 xl:grid-cols-4">{filtered.slice(0,visible).map(item => <PropertyCard key={`${item.kind}:${item.id}`} {...item} compact />)}</div>{visible < filtered.length && <div className="mt-8 flex justify-center"><Button variant="outline" onClick={() => setVisible(v => v+24)}>عرض المزيد</Button></div>}</>}
      {!home && visible < filtered.length && <div ref={sentinel} className="h-1" />}
    </main>
    <footer className="border-t bg-secondary/40"><div className="container flex flex-wrap items-center justify-between gap-4 py-7 text-xs text-muted-foreground"><span>© 2026 EGARK · بدون وسيط من المالك للمستأجر مباشرة</span><div className="flex flex-wrap gap-5"><Link to="/properties">العقارات</Link><Link to="/shared-housing">الشواغر</Link><Link to="/dormitories">الداخليات</Link><Link to="/dashboard">حسابي</Link></div></div></footer>
  </div>;
}
