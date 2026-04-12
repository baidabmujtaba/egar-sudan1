import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { Search, Home, Users, ArrowLeft, Building, MapPin, Shield } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

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

      {/* Hero Section */}
      <section className="relative min-h-[520px] flex items-center overflow-hidden">
        <img
          src={heroBg}
          alt="عقارات"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-foreground/80 via-foreground/60 to-foreground/40" />
        <div className="container relative z-10 py-16 space-y-6">
          <h1 className="text-3xl md:text-5xl font-extrabold text-primary-foreground leading-tight max-w-lg">
            أسهل طريقة تلقى إيجارك
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            ابحث عن عقارات وسكن مشترك في السودان بسهولة وأمان
          </p>
          <div className="flex gap-3 pt-2">
            <Link to="/properties">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
                <Home className="h-4 w-4 ml-2" />تصفح العقارات
              </Button>
            </Link>
            <Link to="/shared-housing">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Users className="h-4 w-4 ml-2" />الشواغر
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="container -mt-8 relative z-20">
        <div className="bg-card rounded-xl shadow-lg border p-4 md:p-6 flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن موقع أو عقار..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 h-12 text-base"
            />
          </div>
          <Link to="/properties">
            <Button size="lg" className="w-full md:w-auto h-12 px-8">
              <Search className="h-4 w-4 ml-2" />بحث
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="container py-10">
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto text-center">
          <div>
            <p className="text-2xl md:text-3xl font-bold text-primary">+{properties.length || 0}</p>
            <p className="text-sm text-muted-foreground">عقار متاح</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-primary">+100</p>
            <p className="text-sm text-muted-foreground">مستخدم</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-bold text-primary">24/7</p>
            <p className="text-sm text-muted-foreground">دعم متواصل</p>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="container pb-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary mb-1">— الأحدث</p>
            <h2 className="text-2xl font-bold">أحدث العقارات</h2>
          </div>
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

      {/* Features */}
      <section className="bg-muted/50 py-12">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-8">لماذا EGARK؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 text-center space-y-3 border">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">عقارات متنوعة</h3>
              <p className="text-sm text-muted-foreground">شقق، منازل، محلات تجارية وأراضي في مختلف المناطق</p>
            </div>
            <div className="bg-card rounded-xl p-6 text-center space-y-3 border">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">مواقع مميزة</h3>
              <p className="text-sm text-muted-foreground">عقارات في أفضل المواقع بالخرطوم والولايات</p>
            </div>
            <div className="bg-card rounded-xl p-6 text-center space-y-3 border">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">تواصل مباشر</h3>
              <p className="text-sm text-muted-foreground">تواصل مع المالك أو الوسيط مباشرة عبر الاتصال أو واتساب</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for non-logged in */}
      {!user && (
        <section className="container py-12 text-center space-y-4">
          <h2 className="text-2xl font-bold">ابدأ الآن</h2>
          <p className="text-muted-foreground">سجل حسابك وابدأ بإضافة عقاراتك أو البحث عن سكن</p>
          <div className="flex gap-3 justify-center">
            <Link to="/register">
              <Button size="lg">إنشاء حساب</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">تسجيل الدخول</Button>
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© 2026 EGARK - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}
