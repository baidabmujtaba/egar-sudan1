import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Building2, Home, BedDouble, Users, Store, BriefcaseBusiness, LayoutGrid, GraduationCap, Warehouse, Search, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DiscoverySearch from "@/components/DiscoverySearch";
import DiscoverySection from "@/components/DiscoverySection";
import PropertyCard from "@/components/PropertyCard";
import { useDiscovery } from "@/hooks/use-discovery";
import { emptyFilters, matchesListing, type DiscoveryFilters, type Listing } from "@/lib/discovery";

const categories = [
  { value: "all", label: "الكل", icon: LayoutGrid }, { value: "شقة", label: "شقق", icon: Building2 },
  { value: "منزل أرضي", label: "منازل", icon: Home }, { value: "غرفة", label: "غرف", icon: BedDouble },
  { value: "shared", label: "سكن مشترك", icon: Users }, { value: "محل تجاري", label: "محلات", icon: Store },
  { value: "مكتب", label: "مكاتب", icon: BriefcaseBusiness }, { value: "dormitory", label: "داخليات", icon: GraduationCap },
  { value: "فيلا", label: "فلل", icon: Warehouse }, { value: "استوديو", label: "استوديو", icon: BedDouble }, { value: "عمارة", label: "عمارات", icon: Building2 },
];
export default function Index({ mode = "all" }: { mode?: "all" | "property" | "shared" | "dormitory" }) {
  const { data: listings = [], isLoading, isError, refetch } = useDiscovery();
  const [params, setParams] = useSearchParams();
  const filters: DiscoveryFilters = { ...emptyFilters, location: params.get("loc") || "", type: params.get("cat") || "all", min: params.get("min") || "", max: params.get("max") || "", currency: params.get("currency") || "SDG", gender: params.get("gender") || "all", meals: params.get("meals") || "all", query: params.get("q") || "" };
  const apply = (next: DiscoveryFilters) => { const p = new URLSearchParams(); if (next.location) p.set("loc", next.location); if (next.type !== "all") p.set("cat", next.type); if (next.min) p.set("min", next.min); if (next.max) p.set("max", next.max); if (next.min || next.max) p.set("currency", next.currency); if (next.gender !== "all") p.set("gender", next.gender); if (next.meals !== "all") p.set("meals", next.meals); if (next.query) p.set("q", next.query); setParams(p); };
  const filtered = useMemo(() => listings.filter(p => (mode === "all" || p.kind === mode) && matchesListing(p, filters)), [listings, mode, params]);
  const [visible, setVisible] = useState(24);
  useEffect(() => setVisible(24), [params, mode]);
  const locations = [...new Set(listings.map(p => p.location))];
  const active = filters.type !== "all" || filters.location || filters.min || filters.max || filters.query || filters.gender !== "all" || filters.meals !== "all";
  const home = mode === "all" && !active;
  const properties = filtered.filter(p => p.kind === "property");
  const khartoum = properties.filter(p => p.property_type === "شقة" && !p.location.includes("أم درمان") && !p.location.includes("كافوري"));
  const omdurman = properties.filter(p => p.location.includes("أم درمان"));
  const budget = properties.filter(p => (p.currency || "SDG") === "SDG").sort((a,b) => a.price - b.price);
  const sections: { title: string; items: Listing[] }[] = [
    { title: "شقق للإيجار في الخرطوم", items: khartoum }, { title: "أحدث العقارات المضافة", items: properties },
    { title: "سكن مشترك", items: filtered.filter(p => p.kind === "shared") }, { title: "إيجارات في أم درمان", items: omdurman },
    { title: "خيارات مناسبة للميزانية", items: budget.slice(0, 12) }, { title: "الداخليات الطلابية", items: filtered.filter(p => p.kind === "dormitory") },
  ];
  const title = mode === "shared" ? "السكن المشترك" : mode === "dormitory" ? "الداخليات الطلابية" : mode === "property" ? "كل العقارات" : "نتائج البحث";
  return <div className="min-h-screen bg-background"><Navbar />
    <div className="discovery-header sticky top-0 z-30 border-b bg-background/95 backdrop-blur-md">
      <div className="container flex justify-center pb-4 pt-4 md:pb-5 md:pt-6"><DiscoverySearch filters={filters} onApply={apply} locations={locations} /></div>
      <div className="container"><nav className="scrollbar-none flex gap-2 overflow-x-auto pb-4" aria-label="فئات العقارات">{categories.map(({value,label,icon: Icon}) => <Button key={value} variant={filters.type === value ? "secondary" : "ghost"} className={`h-10 shrink-0 rounded-full border px-4 text-xs transition-all ${filters.type === value ? "border-primary/25 text-primary" : "border-transparent text-muted-foreground hover:border-border"}`} aria-pressed={filters.type === value} onClick={() => apply({ ...filters, type: value })}><Icon />{label}</Button>)}</nav></div>
    </div>
    <main className="container pb-8 pt-6 md:pt-8">
      {mode !== "all" && <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">{title}</h1><Button asChild variant="outline" className="rounded-full"><Link to={mode === "dormitory" ? "/add-dormitory" : mode === "shared" ? "/add-shared" : "/add-property"}>إضافة {mode === "dormitory" ? "داخلية" : mode === "shared" ? "شاغر" : "عقار"}</Link></Button></div>}
      {(mode === "shared" || mode === "dormitory") && <div className="mb-6 flex flex-wrap gap-3"><Input aria-label="ابحث بالاسم أو الجامعة" placeholder="ابحث بالاسم أو الموقع" value={filters.query} onChange={e => apply({...filters, query:e.target.value})} className="h-11 max-w-sm rounded-full" /><select aria-label="الجنس" className="h-11 rounded-full border bg-card px-4 text-sm" value={filters.gender} onChange={e => apply({...filters,gender:e.target.value})}><option value="all">الكل</option><option value="male">ذكور</option><option value="female">إناث</option><option value="mixed">مختلط</option></select>{mode === "dormitory" && <select aria-label="الوجبات" className="h-11 rounded-full border bg-card px-4 text-sm" value={filters.meals} onChange={e => apply({...filters,meals:e.target.value})}><option value="all">كل الوجبات</option><option value="yes">وجبات مشمولة</option><option value="no">بدون وجبات</option></select>}</div>}
      {isLoading ? <div className="space-y-8" aria-label="جاري تحميل العقارات">{[0,1].map(row => <div key={row}><div className="mb-4 h-6 w-52 animate-pulse rounded bg-muted" /><div className="scrollbar-none flex gap-4 overflow-hidden">{[0,1,2,3].map(i => <div key={i} className="discovery-item shrink-0"><div className="aspect-square animate-pulse rounded-[24px] bg-secondary" /><div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-muted" /><div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-muted" /></div>)}</div></div>)}</div> : isError ? <div className="py-16 text-center"><p className="mb-4">تعذر تحميل الإعلانات</p><Button variant="outline" onClick={() => refetch()}>إعادة المحاولة</Button></div> : filtered.length === 0 ? <div className="py-16 text-center"><Search className="mx-auto mb-4 h-8 w-8 text-muted-foreground" /><h2 className="mb-3 text-lg font-bold">لا توجد إعلانات مطابقة</h2><Button variant="outline" className="rounded-full" onClick={() => apply(emptyFilters)}>مسح الفلاتر</Button></div> : home ? <div className="space-y-9 md:space-y-11">{sections.map(section => <DiscoverySection key={section.title} {...section} />)}<div className="border-t pt-7"><Button asChild variant="outline" className="rounded-full"><Link to="/properties">استكشف كل العقارات<ArrowLeft /></Link></Button></div></div> : <><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">{mode === "all" ? title : `${filtered.length} إعلان`}</h2>{active && <Button variant="link" onClick={() => apply(emptyFilters)}>مسح الفلاتر</Button>}</div><div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.slice(0,visible).map(item => <PropertyCard key={`${item.kind}:${item.id}`} {...item} />)}</div>{visible < filtered.length && <div className="mt-8 flex justify-center"><Button variant="outline" onClick={() => setVisible(v => v+24)}>عرض المزيد</Button></div>}</>}
    </main>
    <footer className="border-t bg-secondary/40"><div className="container flex flex-wrap items-center justify-between gap-4 py-7 text-xs text-muted-foreground"><span>© 2026 EGARK · أسهل طريقة تلقى إيجارك</span><div className="flex flex-wrap gap-5"><Link to="/properties">العقارات</Link><Link to="/shared-housing">الشواغر</Link><Link to="/dormitories">الداخليات</Link><Link to="/dashboard">حسابي</Link></div></div></footer>
  </div>;
}
