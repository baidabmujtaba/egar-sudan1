import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { authReturnKey, safeAuthReturn } from "@/lib/auth-return";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    let completed = false;
    const finish = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active || completed || error || !data.user) return;
      completed = true;
      const destination = safeAuthReturn(sessionStorage.getItem(authReturnKey));
      sessionStorage.removeItem(authReturnKey);
      navigate(destination, { replace: true });
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setTimeout(() => { if (active) void finish(); }, 0);
    });
    void finish();
    const timeout = setTimeout(() => { if (active && !completed) setFailed(true); }, 15000);
    return () => { active = false; subscription.unsubscribe(); clearTimeout(timeout); };
  }, [navigate]);
  return <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
    {failed ? <><p>تعذر إكمال تسجيل الدخول. حاول مرة أخرى.</p><Button asChild><Link to="/login">تسجيل الدخول</Link></Button></> : <><Loader2 className="h-8 w-8 animate-spin text-primary" /><p>جاري إكمال تسجيل الدخول...</p></>}
  </main>;
}