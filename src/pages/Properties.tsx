import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { Search } from "lucide-react";

export default function Properties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

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
    const matchSearch = p.title.includes(search) || p.location.includes(search);
    const matchType = typeFilter === "all" || p.property_type === typeFilter;
    return matchSearch && matchType;
  });

  const types = [...new Set(properties.map(p => p.property_type))];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 space-y-6">
        <h1 className="text-2xl font-bold">العقارات المتاحة</h1>
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="ابحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">لا توجد عقارات</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(p => <PropertyCard key={p.id} {...p} images={p.property_images} />)}
          </div>
        )}
      </div>
    </div>
  );
}
