import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import DormitoryCard from "@/components/DormitoryCard";
import { Search, GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Dormitories() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [mealsFilter, setMealsFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("dormitories")
          .select("*")
          .eq("status", "approved")
          .order("created_at", { ascending: false });
        if (error) console.error("Dormitories fetch error:", error);
        setItems(data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = items.filter(i => {
    const matchSearch = !search || i.title?.includes(search) || i.location?.includes(search) || i.nearby_university?.includes(search);
    const matchGender = genderFilter === "all" || i.gender === genderFilter;
    const matchMeals = mealsFilter === "all" || (mealsFilter === "yes" ? i.meals_included : !i.meals_included);
    return matchSearch && matchGender && matchMeals;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">الداخليات الطلابية</h1>
          </div>
          {user && (
            <Link to="/add-dormitory">
              <Button size="sm"><Plus className="h-4 w-4 ml-1" />إضافة داخلية</Button>
            </Link>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="ابحث بالاسم أو الجامعة..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
          </div>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="الجنس" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="male">ذكور</SelectItem>
              <SelectItem value="female">إناث</SelectItem>
              <SelectItem value="mixed">مختلط</SelectItem>
            </SelectContent>
          </Select>
          <Select value={mealsFilter} onValueChange={setMealsFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="الوجبات" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="yes">وجبات مشمولة</SelectItem>
              <SelectItem value="no">بدون وجبات</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">لا توجد داخليات حالياً</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(i => <DormitoryCard key={i.id} {...i} />)}
          </div>
        )}
      </div>
    </div>
  );
}