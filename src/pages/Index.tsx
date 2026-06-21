import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import {
  Search, Home, Users, Building, Building2, MapPin, Phone, Mail,
  MessageCircle, Facebook, Instagram, Menu, User, LogOut, Plus, Shield,
  Sliders, Globe, BedDouble, Warehouse, Sparkles, GraduationCap,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PAGE_SIZE = 12;

const CATEGORIES = [
  { value: "all", label: "الكل", icon: Sparkles },
  { value: "شقة", label: "شقق", icon: Building },
  { value: "منزل أرضي", label: "أرضي", icon: Home },
  { value: "عمارة", label: "عمارات", icon: Building2 },
  { value: "فيلا", label: "فلل", icon: Warehouse },
  { value: "استوديو", label: "استوديو", icon: BedDouble },
  { value: "shared", label: "سكن مشترك", icon: Users },
  { value: "dormitories", label: "داخليات", icon: GraduationCap },
];

export default function Index() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState(() => searchParams.get("cat") || "all");
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [location, setLocation] = useState(() => searchParams.get("loc") || "");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(() => {
    const t = searchParams.get("types");
    return t ? t.split(",").filter(Boolean) : [];
  });
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Persist filter state to the URL (shareable links)
  useEffect(() => {
    const params = new URLSearchParams();
    if (category && category !== "all") params.set("cat", category);
    if (search) params.set("q", search);
    if (location) params.set("loc", location);
    if (selectedTypes.length) params.set("types", selectedTypes.join(","));
    setSearchParams(params, { replace: true });
  }, [category, search, location, selectedTypes, setSearchParams]);

  const loadPage = useCallback(async (pageIndex: number) => {
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*, property_images(image_url)")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) {
        console.error("Properties fetch error:", error);
        return { rows: [] as any[], end: true };
      }
      const rows = data || [];
      return { rows, end: rows.length < PAGE_SIZE };
    } catch (err) {
      console.error("Properties fetch exception:", err);
      return { rows: [] as any[], end: true };
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { rows, end } = await loadPage(0);
      setProperties(rows);
      setHasMore(!end);
      setPage(0);
      setLoading(false);
    })();
  }, [loadPage]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(async (entries) => {
      if (!entries[0].isIntersecting || loadingMore || !hasMore) return;
      setLoadingMore(true);
      const next = page + 1;
      const { rows, end } = await loadPage(next);
      setProperties(prev => [...prev, ...rows]);
      setHasMore(!end);
      setPage(next);
      setLoadingMore(false);
    }, { rootMargin: "600px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [page, hasMore, loading, loadingMore, loadPage]);

  const handleCategory = (val: string) => {
    if (val === "shared") {
      navigate("/shared-housing");
      return;
    }
    if (val === "dormitories") {
      navigate("/dormitories");
      return;
    }
    setCategory(val);
  };

  const filtered = properties.filter(p => {
    const matchCat = category === "all" || p.property_type === category;
    const matchSearch = !search || p.title?.includes(search) || p.location?.includes(search);
    const matchLocation = !location || p.location?.toLowerCase().includes(location.toLowerCase());
    const matchTypes = selectedTypes.length === 0 || selectedTypes.includes(p.property_type);
    return matchCat && matchSearch && matchLocation && matchTypes;
  });

  const toggleType = (t: string) =>
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const TYPE_CHIPS = ["شقة", "منزل أرضي", "عمارة", "فيلا", "استوديو"];
  const resetFilters = () => {
    setLocation(""); setSelectedTypes([]); setSearch(""); setCategory("all");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Airbnb-style header: logo + compact search pill + user menu */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center gap-3 h-20">
          {/* User menu (top-left in RTL) */}
          <div className="order-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 border rounded-full py-1.5 pr-2 pl-3 hover:shadow-md transition-shadow">
                  <Menu className="h-4 w-4" />
                  <div className="h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {user ? (
                  <>
                    <DropdownMenuItem className="font-semibold" disabled>
                      {profile?.full_name || "مرحباً"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <User className="h-4 w-4 ml-2" />لوحتي
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/add-property")}>
                      <Plus className="h-4 w-4 ml-2" />إضافة عقار
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/add-shared")}>
                      <Users className="h-4 w-4 ml-2" />إضافة شاغر
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Shield className="h-4 w-4 ml-2" />الإدارة
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 ml-2" />خروج
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/register")} className="font-semibold">
                      إنشاء حساب
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/login")}>
                      تسجيل الدخول
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/shared-housing")}>
                      <Users className="h-4 w-4 ml-2" />سكن مشترك
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/register")}>
                      <Plus className="h-4 w-4 ml-2" />أضف عقارك
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Compact search pill (center) */}
          <div className="order-2 flex-1 flex justify-center">
            <button
              onClick={() => {
                const el = document.getElementById("expanded-search");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
                setTimeout(() => document.getElementById("search-input")?.focus(), 400);
              }}
              className="flex items-center gap-2 md:gap-3 border rounded-full py-2 pr-5 pl-2 shadow-sm hover:shadow-md transition-shadow text-sm md:text-base"
            >
              <span className="font-semibold">في أي مكان</span>
              <span className="h-5 w-px bg-border" />
              <span className="font-semibold hidden sm:inline">أي فترة</span>
              <span className="h-5 w-px bg-border hidden sm:block" />
              <span className="text-muted-foreground hidden sm:inline">أضف نوع</span>
              <span className="bg-primary text-primary-foreground rounded-full p-2">
                <Search className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>

          {/* Logo (top-right in RTL) */}
          <Link to="/" className="order-3 flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary hidden sm:inline">EGARK</span>
          </Link>
        </div>

        {/* Categories icon row */}
        <div className="border-t">
          <div className="container">
            <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none">
              {CATEGORIES.map(({ value, label, icon: Icon }) => {
                const active = category === value;
                return (
                  <button
                    key={value}
                    onClick={() => handleCategory(value)}
                    className={`flex flex-col items-center gap-1.5 px-3 py-2 border-b-2 whitespace-nowrap min-w-[72px] transition-colors ${
                      active
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                );
              })}
              <button className="flex items-center gap-2 mr-2 border rounded-xl px-4 py-2 text-sm font-medium hover:border-foreground whitespace-nowrap">
                <Sliders className="h-4 w-4" /> فلترة
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Expanded search input (revealed on header pill click) */}
      <div id="expanded-search" className="container pt-5">
        <div className="relative max-w-3xl mx-auto">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            id="search-input"
            placeholder="ابحث عن موقع أو عنوان عقار..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pr-11 pl-4 border rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Sticky horizontal filter bar */}
      <div className="sticky top-[140px] z-40 bg-background/95 backdrop-blur border-y mt-4">
        <div className="container py-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Location */}
            <div className="relative flex-1 min-w-0">
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="المدينة أو الحي"
                className="h-10 pr-9"
              />
            </div>

            {/* Type chips */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none lg:flex-shrink-0">
              {TYPE_CHIPS.map(t => {
                const active = selectedTypes.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleType(t)}
                    className={`px-3 h-9 rounded-full border text-xs font-medium whitespace-nowrap transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:border-foreground"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            {(location || selectedTypes.length > 0) && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="lg:flex-shrink-0">
                مسح
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Image-led grid with infinite scroll */}
      <main className="container py-6 md:py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square sm:aspect-[4/5] rounded-2xl bg-muted animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-semibold mb-2">لا توجد عقارات مطابقة</p>
            <p className="text-sm text-muted-foreground mb-4">جرب تغيير الفئة أو البحث بكلمة أخرى</p>
            <Button variant="outline" onClick={() => { setCategory("all"); setSearch(""); }}>إلغاء الفلاتر</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {filtered.map((p) => (
                <PropertyCard key={p.id} {...p} images={p.property_images} />
              ))}
            </div>
            <div ref={sentinelRef} className="h-12" />
            {loadingMore && (
              <div className="text-center py-6 text-sm text-muted-foreground">جاري تحميل المزيد...</div>
            )}
            {!hasMore && properties.length > 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">— انتهت العروض —</div>
            )}
          </>
        )}
      </main>

      {/* Airbnb-style minimal footer */}
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
