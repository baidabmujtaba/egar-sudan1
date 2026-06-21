import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, Plus, User, Shield, LogOut, Menu, X, Users, GraduationCap } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-gradient">EGARK</span>
        </Link>

        {/* Mobile: login button (top-left) + menu */}
        <div className="md:hidden flex items-center gap-2">
          {user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut} className="rounded-full">
              <LogOut className="h-4 w-4 ml-1" />خروج
            </Button>
          ) : (
            <Link to="/login">
              <Button size="sm" className="rounded-full">تسجيل الدخول</Button>
            </Link>
          )}
          <button className="p-2" onClick={() => setOpen(!open)} aria-label="القائمة">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/properties">
            <Button variant="ghost" size="sm">العقارات</Button>
          </Link>
          <Link to="/shared-housing">
            <Button variant="ghost" size="sm">شواغر</Button>
          </Link>
          <Link to="/dormitories">
            <Button variant="ghost" size="sm"><GraduationCap className="h-4 w-4 ml-1" />داخليات</Button>
          </Link>
          {user ? (
            <>
              <Link to="/add-property">
                <Button variant="ghost" size="sm"><Plus className="h-4 w-4 ml-1" />إضافة عقار</Button>
              </Link>
              <Link to="/add-shared">
                <Button variant="ghost" size="sm"><Users className="h-4 w-4 ml-1" />إضافة شاغر</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm"><User className="h-4 w-4 ml-1" />لوحتي</Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm"><Shield className="h-4 w-4 ml-1" />الإدارة</Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 ml-1" />خروج
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm">تسجيل الدخول</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t bg-card p-4 space-y-2 animate-fade-in">
          <Link to="/properties" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">العقارات</Button>
          </Link>
          <Link to="/shared-housing" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">شواغر</Button>
          </Link>
          <Link to="/dormitories" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start"><GraduationCap className="h-4 w-4 ml-2" />داخليات طلابية</Button>
          </Link>
          {user ? (
            <>
              <Link to="/add-property" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start"><Plus className="h-4 w-4 ml-2" />إضافة عقار</Button>
              </Link>
              <Link to="/add-shared" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start"><Users className="h-4 w-4 ml-2" />إضافة شاغر</Button>
              </Link>
              <Link to="/dashboard" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start"><User className="h-4 w-4 ml-2" />لوحتي</Button>
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start"><Shield className="h-4 w-4 ml-2" />الإدارة</Button>
                </Link>
              )}
              <Button variant="outline" className="w-full" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 ml-2" />خروج
              </Button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)}>
              <Button className="w-full">تسجيل الدخول</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
