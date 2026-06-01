import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { Search, Home, Users, ArrowLeft, Building, MapPin, Shield, Phone, Mail, CheckCircle2, MessageCircle, Facebook, Instagram } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export default function Index() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*, property_images(image_url)")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(6);
        if (error) {
          console.error("Properties fetch error:", error);
          setFetchError(error.message);
        }
        setProperties(data || []);
      } catch (err: any) {
        console.error("Properties fetch exception:", err);
        setFetchError(err?.message || "خطأ غير معروف");
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filtered = properties.filter(p =>
    p.title.includes(search) || p.location.includes(search)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top utility bar — website feel */}
      <div className="hidden md:block bg-foreground text-primary-foreground/90 text-xs">
        <div className="container flex items-center justify-between h-9">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> 0911 645 8724</span>
            <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> info@egark.sd</span>
          </div>
          <div className="flex items-center gap-4">
            <span>تابعنا:</span>
            <a href="#" aria-label="Facebook" className="hover:text-primary-foreground"><Facebook className="h-3.5 w-3.5" /></a>
            <a href="#" aria-label="Instagram" className="hover:text-primary-foreground"><Instagram className="h-3.5 w-3.5" /></a>
          </div>
        </div>
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[480px] md:min-h-[600px] lg:min-h-[680px] flex items-center overflow-hidden">
        <img
          src={heroBg}
          alt="عقارات"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-foreground/80 via-foreground/60 to-foreground/40" />
        <div className="container relative z-10 py-16 md:py-24 space-y-5 md:space-y-7 max-w-6xl">
          <span className="inline-flex items-center gap-2 bg-primary-foreground/15 backdrop-blur text-primary-foreground text-xs md:text-sm px-3 py-1.5 rounded-full border border-primary-foreground/20">
            <CheckCircle2 className="h-3.5 w-3.5" /> منصة EGARK — العقارات والشواغر في السودان
          </span>
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-extrabold text-primary-foreground leading-tight max-w-2xl">
            أسهل طريقة تلقى إيجارك
          </h1>
          <p className="text-primary-foreground/85 text-base md:text-xl max-w-xl">
            ابحث عن عقارات وسكن مشترك في السودان بسهولة وأمان — كل العروض في مكان واحد
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/properties">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg md:h-12 md:px-8 md:text-base">
                <Home className="h-4 w-4 ml-2" />تصفح العقارات
              </Button>
            </Link>
            <Link to="/shared-housing">
              <Button size="lg" className="bg-orange-500 text-white hover:bg-orange-600 shadow-lg md:h-12 md:px-8 md:text-base">
                <Users className="h-4 w-4 ml-2" />الشواغر
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="container -mt-8 md:-mt-12 relative z-20 max-w-5xl">
        <div className="bg-card rounded-2xl shadow-xl border p-4 md:p-6 flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن موقع أو عقار..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 h-12 md:h-14 text-base"
            />
          </div>
          <Link to="/properties">
            <Button size="lg" className="w-full md:w-auto h-12 md:h-14 px-8">
              <Search className="h-4 w-4 ml-2" />بحث
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories strip */}
      <section className="container pt-10 md:pt-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "شقق", to: "/properties", icon: Building },
            { label: "عمارات", to: "/properties", icon: Home },
            { label: "شواغر", to: "/shared-housing", icon: Users },
            { label: "منازل أرضية", to: "/properties", icon: MapPin },
          ].map(({ label, to, icon: Icon }) => (
            <Link key={label} to={to} className="group bg-card border rounded-xl p-4 md:p-5 flex items-center gap-3 hover:border-primary hover:shadow-md transition-all">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm md:text-base">{label}</p>
                <p className="text-xs text-muted-foreground">تصفح الآن</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="container py-10 md:py-14">
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto text-center">
          <div>
            <p className="text-2xl md:text-4xl font-bold text-primary">+{properties.length || 0}</p>
            <p className="text-sm md:text-base text-muted-foreground">عقار متاح</p>
          </div>
          <div>
            <p className="text-2xl md:text-4xl font-bold text-primary">+100</p>
            <p className="text-sm md:text-base text-muted-foreground">مستخدم</p>
          </div>
          <div>
            <p className="text-2xl md:text-4xl font-bold text-primary">24/7</p>
            <p className="text-sm md:text-base text-muted-foreground">دعم متواصل</p>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="container pb-12 md:pb-16 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary mb-1">— الأحدث</p>
            <h2 className="text-2xl md:text-3xl font-bold">أحدث العقارات</h2>
          </div>
          <Link to="/properties">
            <Button variant="ghost" size="sm">عرض الكل <ArrowLeft className="h-4 w-4 mr-1" /></Button>
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>
        ) : fetchError ? (
          <div className="text-center py-10 text-destructive">
            <p>حدث خطأ في تحميل العقارات</p>
            <p className="text-sm mt-1">{fetchError}</p>
            <Button variant="outline" className="mt-3" onClick={() => window.location.reload()}>إعادة المحاولة</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">لا توجد عقارات حالياً</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {filtered.map((p) => (
              <PropertyCard key={p.id} {...p} images={p.property_images} />
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-muted/50 py-12 md:py-20">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">لماذا EGARK؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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

      {/* How it works */}
      <section className="container py-12 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <p className="text-sm font-medium text-primary mb-2">— كيف يعمل</p>
          <h2 className="text-2xl md:text-3xl font-bold">3 خطوات بسيطة للحصول على إيجارك</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { n: "1", t: "ابحث", d: "تصفح العقارات والشواغر حسب الموقع والنوع" },
            { n: "2", t: "تواصل", d: "تواصل مع المالك مباشرة عبر الاتصال أو واتساب" },
            { n: "3", t: "استأجر", d: "اتفق وادخل بيتك الجديد بكل سهولة وأمان" },
          ].map((s) => (
            <div key={s.n} className="relative bg-card border rounded-2xl p-6 md:p-8 text-center">
              <div className="absolute -top-5 right-1/2 translate-x-1/2 h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-lg">
                {s.n}
              </div>
              <h3 className="font-bold text-lg mt-3">{s.t}</h3>
              <p className="text-sm text-muted-foreground mt-2">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="container pb-12 md:pb-20">
        <div className="rounded-2xl md:rounded-3xl gradient-hero p-8 md:p-14 text-center text-primary-foreground space-y-4 shadow-xl">
          <h2 className="text-2xl md:text-4xl font-bold">عندك عقار للإيجار؟</h2>
          <p className="text-primary-foreground/90 max-w-xl mx-auto">
            أضف عقارك أو شاغرك مجاناً وأوصل لآلاف المستخدمين خلال دقائق
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link to={user ? "/add-property" : "/register"}>
              <Button size="lg" variant="secondary" className="md:h-12 md:px-8">إضافة عقار</Button>
            </Link>
            <Link to={user ? "/add-shared" : "/register"}>
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white md:h-12 md:px-8">إضافة شاغر</Button>
            </Link>
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
      <footer className="bg-foreground text-primary-foreground mt-8">
        <div className="container py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <Home className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">EGARK</span>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              منصة سودانية لتأجير العقارات والسكن المشترك بسهولة وأمان.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-3">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/properties" className="hover:text-primary-foreground">العقارات</Link></li>
              <li><Link to="/shared-housing" className="hover:text-primary-foreground">الشواغر</Link></li>
              <li><Link to="/add-property" className="hover:text-primary-foreground">إضافة عقار</Link></li>
              <li><Link to="/add-shared" className="hover:text-primary-foreground">إضافة شاغر</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">الحساب</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/login" className="hover:text-primary-foreground">تسجيل الدخول</Link></li>
              <li><Link to="/register" className="hover:text-primary-foreground">إنشاء حساب</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary-foreground">لوحتي</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">تواصل معنا</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> 0911 645 8724</li>
              <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> واتساب الدعم</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@egark.sd</li>
            </ul>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" aria-label="Facebook" className="h-8 w-8 rounded-full bg-primary-foreground/10 hover:bg-primary flex items-center justify-center"><Facebook className="h-4 w-4" /></a>
              <a href="#" aria-label="Instagram" className="h-8 w-8 rounded-full bg-primary-foreground/10 hover:bg-primary flex items-center justify-center"><Instagram className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10">
          <div className="container py-4 text-xs text-primary-foreground/60 text-center">
            © 2026 EGARK — جميع الحقوق محفوظة
          </div>
        </div>
      </footer>
    </div>
  );
}
