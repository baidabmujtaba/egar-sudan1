import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, Plus, UserRound, Shield, LogOut, Menu, Heart, Users, GraduationCap } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  return <header className="border-b bg-card">
    <div className="container flex h-[68px] items-center justify-between gap-3 md:h-20">
      <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="EGARK الرئيسية"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Home className="h-5 w-5" /></span><span className="text-[23px] font-extrabold text-primary">EGARK</span></Link>
      <nav className="hidden items-center gap-1 lg:flex" aria-label="الأقسام"><Button asChild variant="ghost" className="rounded-full"><Link to="/properties">العقارات</Link></Button><Button asChild variant="ghost" className="rounded-full"><Link to="/shared-housing">السكن المشترك</Link></Button><Button asChild variant="ghost" className="rounded-full"><Link to="/dormitories">الداخليات</Link></Button></nav>
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" className="hidden rounded-full md:inline-flex"><Link to={user ? "/add-property" : "/register"}><Plus />أضف عقارك</Link></Button>
        {!user && <Button asChild variant="ghost" size="sm" className="rounded-full text-xs text-primary"><Link to="/login">تسجيل الدخول</Link></Button>}
        <DropdownMenu dir="rtl"><DropdownMenuTrigger asChild><Button variant="outline" className="h-10 gap-2 rounded-full px-3" aria-label="قائمة الحساب"><Menu /><UserRound /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {user && <><DropdownMenuItem disabled>{profile?.full_name || "حسابي"}</DropdownMenuItem><DropdownMenuItem onClick={() => navigate("/dashboard")}><UserRound className="ml-2 h-4 w-4" />لوحتي</DropdownMenuItem>{isAdmin && <DropdownMenuItem onClick={() => navigate("/admin")}><Shield className="ml-2 h-4 w-4" />الإدارة</DropdownMenuItem>}<DropdownMenuSeparator /></>}
            <DropdownMenuItem onClick={() => navigate("/favorites")}><Heart className="ml-2 h-4 w-4" />المفضلة</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(user ? "/add-property" : "/register")}><Plus className="ml-2 h-4 w-4" />إضافة عقار</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(user ? "/add-shared" : "/register")}><Users className="ml-2 h-4 w-4" />إضافة شاغر</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(user ? "/add-dormitory" : "/register")}><GraduationCap className="ml-2 h-4 w-4" />إضافة داخلية</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/properties")}>العقارات</DropdownMenuItem><DropdownMenuItem onClick={() => navigate("/shared-housing")}>الشواغر</DropdownMenuItem><DropdownMenuItem onClick={() => navigate("/dormitories")}>الداخليات</DropdownMenuItem>
            <DropdownMenuSeparator />{user ? <DropdownMenuItem onClick={async () => { await signOut(); navigate("/"); }}><LogOut className="ml-2 h-4 w-4" />خروج</DropdownMenuItem> : <><DropdownMenuItem onClick={() => navigate("/login")}>تسجيل الدخول</DropdownMenuItem><DropdownMenuItem onClick={() => navigate("/register")}>إنشاء حساب</DropdownMenuItem></>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>;
}
