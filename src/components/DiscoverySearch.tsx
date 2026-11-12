import { useEffect, useState } from "react";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { emptyFilters, type DiscoveryFilters } from "@/lib/discovery";

export const propertyTypes = ["شقة", "منزل أرضي", "عمارة", "فيلا", "استوديو", "غرفة", "محل تجاري", "مكتب"];
export default function DiscoverySearch({ filters, onApply, locations }: { filters: DiscoveryFilters; onApply: (value: DiscoveryFilters) => void; locations: string[] }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  useEffect(() => { if (open) setDraft(filters); }, [open, filters]);
  const set = (field: keyof DiscoveryFilters, value: string) => setDraft(prev => ({ ...prev, [field]: value }));
  const invalid = (draft.min !== "" && Number(draft.min) < 0) || (draft.max !== "" && Number(draft.max) < 0) || (draft.min !== "" && draft.max !== "" && Number(draft.min) > Number(draft.max));
  return <>
    <Button variant="outline" onClick={() => setOpen(true)} className="search-pill h-[66px] w-full justify-start gap-4 rounded-full border-border bg-card px-5 text-right shadow-sm hover:bg-card md:h-[64px] md:max-w-xl" aria-label="ابحث عن إيجارك">
      <Search className="!h-6 !w-6 text-primary" />
      <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-bold">{filters.location || "ابحث عن إيجارك"}</span><span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">{filters.type === "all" ? "أي موقع" : filters.type} · {filters.min || filters.max ? "ميزانية محددة" : "أي ميزانية"}</span></span>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border bg-secondary"><SlidersHorizontal /></span>
    </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="search-dialog flex max-h-[100dvh] w-full max-w-xl flex-col gap-0 overflow-hidden p-0" dir="rtl">
        <div className="border-b px-6 py-5 text-center"><DialogTitle className="tracking-normal">ابحث عن إيجارك</DialogTitle><DialogDescription className="sr-only">تحديد الموقع ونوع العقار والميزانية</DialogDescription></div>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={e => { e.preventDefault(); if (!invalid) { onApply(draft); setOpen(false); } }}>
          <div className="space-y-7 overflow-y-auto px-6 py-6">
            <div className="space-y-3"><label htmlFor="discovery-location" className="text-lg font-bold">أين تبحث؟</label><div className="relative"><MapPin className="absolute right-4 top-4 h-5 w-5 text-muted-foreground" /><Input id="discovery-location" list="egark-locations" value={draft.location} onChange={e => set("location", e.target.value)} placeholder="المدينة أو الحي" className="h-14 rounded-xl pr-12" /><datalist id="egark-locations">{locations.map(value => <option key={value} value={value} />)}</datalist></div>
              <div className="flex flex-wrap gap-2">{["الخرطوم", "أم درمان", "كافوري"].map(value => <Button key={value} type="button" size="sm" variant={draft.location === value ? "default" : "outline"} className="rounded-full" onClick={() => set("location", value)}>{value}</Button>)}</div>
            </div>
            <fieldset className="space-y-3"><legend className="text-lg font-bold">نوع العقار</legend><div className="flex flex-wrap gap-2">{[{ value: "all", label: "الكل" }, ...propertyTypes.map(value => ({ value, label: value })), { value: "shared", label: "سكن مشترك" }, { value: "dormitory", label: "داخلية" }].map(({ value, label }) => <Button type="button" key={value} variant={draft.type === value ? "default" : "outline"} className="rounded-full" aria-pressed={draft.type === value} onClick={() => set("type", value)}>{label}</Button>)}</div></fieldset>
            <fieldset className="space-y-3"><legend className="text-lg font-bold">الميزانية</legend><div className="flex gap-2">{["SDG", "USD"].map(value => <Button key={value} type="button" size="sm" className="rounded-full" variant={draft.currency === value ? "secondary" : "ghost"} onClick={() => set("currency", value)} aria-pressed={draft.currency === value}>{value === "SDG" ? "جنيه سوداني" : "دولار"}</Button>)}</div><div className="grid grid-cols-2 gap-3"><div><label htmlFor="budget-min" className="mb-2 block text-sm text-muted-foreground">من</label><Input id="budget-min" type="number" min="0" value={draft.min} onChange={e => set("min", e.target.value)} placeholder="بدون حد أدنى" className="h-12 rounded-xl" /></div><div><label htmlFor="budget-max" className="mb-2 block text-sm text-muted-foreground">إلى</label><Input id="budget-max" type="number" min="0" value={draft.max} onChange={e => set("max", e.target.value)} placeholder="بدون حد أقصى" className="h-12 rounded-xl" /></div></div>{invalid && <p role="alert" className="text-sm text-destructive">أدخل ميزانية صحيحة؛ الحد الأعلى لا يقل عن الحد الأدنى.</p>}</fieldset>
            <div className="space-y-2"><label htmlFor="rooms-unavailable" className="text-lg font-bold">عدد الغرف</label><Input id="rooms-unavailable" disabled value="غير محدد في بيانات الإعلانات الحالية" className="h-12 rounded-xl" /></div>
          </div>
          <div className="flex items-center justify-between border-t bg-card p-5"><Button type="button" variant="link" className="text-foreground" onClick={() => setDraft(emptyFilters)}>مسح الفلاتر</Button><Button type="submit" className="h-12 rounded-xl px-8" disabled={invalid}><Search />بحث</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  </>;
}