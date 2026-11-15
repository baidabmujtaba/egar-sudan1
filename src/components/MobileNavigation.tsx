import { NavLink, useLocation } from "react-router-dom";
import { Search, Heart, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function MobileNavigation() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  if (pathname === "/admin") return null;
  return <nav className="mobile-navigation fixed inset-x-0 bottom-0 z-40 border-t bg-card md:hidden" aria-label="التنقل الرئيسي">
    <div className="mx-auto grid max-w-[300px] grid-cols-3">
      {[{ to: "/", label: "استكشف", icon: Search, active: ["/", "/index", "/properties", "/shared-housing", "/dormitories"].includes(pathname) },
        { to: "/favorites", label: "المفضلة", icon: Heart, active: pathname === "/favorites" },
        { to: user ? "/dashboard" : "/login", label: user ? "حسابي" : "تسجيل الدخول", icon: UserRound, active: ["/dashboard", "/login", "/register"].includes(pathname) }].map(({ to, label, icon: Icon, active }) =>
        <Button asChild variant="ghost" key={to} className={`h-[76px] flex-col gap-1 rounded-none px-1 text-[11px] hover:bg-transparent ${active ? "text-primary" : "text-muted-foreground"}`}>
          <NavLink to={to} aria-label={label}><Icon className="!h-[29px] !w-[29px]" strokeWidth={1.7} /><span>{label}</span></NavLink>
        </Button>)}
    </div>
  </nav>;
}