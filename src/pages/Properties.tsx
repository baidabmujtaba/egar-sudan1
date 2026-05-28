import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { Search, MapPin, Home, Building, Building2, Users, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const TYPE_OPTIONS = [
  { value: "all", label: "الكل", icon: SlidersHorizontal },
  { value: "شقة", label: "شقة", icon: Building },
  { value: "منزل أرضي", label: "أرضي", icon: Home },
  { value: "عمارة", label: "عمارة", icon: Building2 },
  { value: "شاغر", label: "شاغر", icon: Users },
];

export default function Properties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("properties")
        .select("*, property_images(image_url)")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      setProperties(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = properties.filter(p => {
    const matchSearch = !search || p.title.includes(search) || p.location.includes(search);
    const matchType = typeFilter === "all" || p.property_type === typeFilter;
    const matchLocation = locationFilter === "all" || p.location === locationFilter;
    return matchSearch && matchType && matchLocation;
  });

  const locations = [...new Set(properties.map(p => p.location))].filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Airbnb-like sticky filter bar */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
        <div className="container py-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث باسم العقار..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 h-11 rounded-full"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="h-11 md:w-56 rounded-full">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="الموقع" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المواقع</SelectItem>
                {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Type pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {TYPE_OPTIONS.map(({ value, label, icon: Icon }) => {
              const active = typeFilter === value;
              return (
                <button
                  key={value}
                  onClick={() => setTypeFilter(value)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${
                    active ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container py-6 md:py-8">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">{filtered.length} عقار متاح</p>
        </div>
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-semibold mb-2">لا توجد نتائج مطابقة</p>
            <p className="text-sm text-muted-foreground mb-4">جرب تعديل الفلاتر أو البحث بكلمة أخرى</p>
            <Button variant="outline" onClick={() => { setSearch(""); setTypeFilter("all"); setLocationFilter("all"); }}>إلغاء الفلاتر</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filtered.map(p => <PropertyCard key={p.id} {...p} images={p.property_images} />)}
          </div>
        )}
      </div>
    </div>
  );
}
