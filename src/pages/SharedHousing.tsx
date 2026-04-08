import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import SharedHousingCard from "@/components/SharedHousingCard";
import { Search } from "lucide-react";

export default function SharedHousing() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("shared_housing")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      setItems(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = items.filter(i => {
    const matchSearch = i.title.includes(search) || i.location.includes(search);
    const matchGender = genderFilter === "all" || i.gender === genderFilter;
    return matchSearch && matchGender;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 space-y-6">
        <h1 className="text-2xl font-bold">شواغر</h1>
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="ابحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
          </div>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="الجنس" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="male">ذكور</SelectItem>
              <SelectItem value="female">إناث</SelectItem>
              <SelectItem value="mixed">مختلط</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">لا توجد شواغر حالياً</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(i => <SharedHousingCard key={i.id} {...i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
