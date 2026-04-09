import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { Search, Home, Users, ArrowLeft, LogIn, UserPlus } from "lucide-react";

export default function Index() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data } = await supabase
        .from("properties")
        .select("*, property_images(image_url)")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6);
      setProperties(data || []);
      setLoading(false);
    };
    fetchProperties();
  }, []);

  const filtered = properties.filter(p =>
    p.title.includes(search) || p.location.includes(search)
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero py-16 px-4">
        <div className="container text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-extrabold text-primary-foreground">
            أسهل طريقة تلقى إيجارك
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-md mx-auto">
            ابحث عن عقارات وسكن مشترك في السودان بسهولة
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              placeholder="ابحث عن موقع أو عقار..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card border-0"
            />
            <Button size="icon" variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-3 justify-center">
            <Link to="/properties">
              <Button variant="secondary" size="lg">
                <Home className="h-4 w-4 ml-2" />عقارات
              </Button>
            </Link>
            <Link to="/shared-housing">
              <Button variant="secondary" size="lg">
                <Users className="h-4 w-4 ml-2" />شواغر
              </Button>
            </Link>
          </div>
          {!user && (
            <div className="flex gap-3 justify-center pt-2">
              <Link to="/login">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  <LogIn className="h-4 w-4 ml-2" />تسجيل الدخول
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <UserPlus className="h-4 w-4 ml-2" />حساب جديد
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Latest properties */}
      <section className="container py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">أحدث العقارات</h2>
          <Link to="/properties">
            <Button variant="ghost" size="sm">عرض الكل <ArrowLeft className="h-4 w-4 mr-1" /></Button>
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">لا توجد عقارات حالياً</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <PropertyCard key={p.id} {...p} images={p.property_images} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© 2026 EGARK - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}
