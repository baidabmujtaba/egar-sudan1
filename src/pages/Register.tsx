import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";
import SocialSignIn from "@/components/SocialSignIn";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\s+/g, "");
    if (!/^[0-9]{7,15}$/.test(cleanPhone)) {
      toast.error("رقم الهاتف غير صالح. أدخل أرقاماً فقط (7-15 رقم)");
      return;
    }
    if (!fullName.trim()) {
      toast.error("الاسم الكامل مطلوب");
      return;
    }
    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setLoading(true);
    try {
      await signUp(cleanPhone, password, fullName.trim(), cleanPhone);
      toast.success("تم إنشاء الحساب بنجاح");
      navigate("/");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("registered")) {
        toast.error("رقم الهاتف مستخدم بالفعل");
      } else {
        toast.error(msg || "حدث خطأ في التسجيل");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container flex items-center justify-center py-6 md:py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <SocialSignIn destination={location.state?.from} />
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />أو<span className="h-px flex-1 bg-border" /></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
                <Input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="أدخل رقم الهاتف" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">كلمة المرور</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />جاري التسجيل...</> : "تسجيل"}
              </Button>
            </form>
            <p className="text-center text-sm mt-4 text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link to="/login" state={location.state} className="text-primary font-medium">سجل دخولك</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
