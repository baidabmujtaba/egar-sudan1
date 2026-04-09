import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Trash2, Pencil } from "lucide-react";

const statusLabel: Record<string, string> = { pending: "قيد المراجعة", approved: "مقبول" };
const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = { pending: "secondary", approved: "default" };

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [shared, setShared] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    const [{ data: props }, { data: sh }] = await Promise.all([
      supabase.from("properties").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("shared_housing").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setProperties(props || []);
    setShared(sh || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const deleteProperty = async (id: string) => {
    await supabase.from("properties").delete().eq("id", id);
    toast.success("تم حذف العقار");
    fetchData();
  };

  const deleteShared = async (id: string) => {
    await supabase.from("shared_housing").delete().eq("id", id);
    toast.success("تم حذف السكن المشترك");
    fetchData();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 space-y-8">
        <h1 className="text-2xl font-bold">لوحتي</h1>
        {loading ? <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div> : (
          <>
            <Card>
              <CardHeader><CardTitle>عقاراتي ({properties.length})</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {properties.length === 0 ? <p className="text-muted-foreground text-sm">لا توجد عقارات</p> :
                  properties.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-sm text-muted-foreground">{p.location} - {p.price.toLocaleString()} ج.س</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant[p.status]}>{statusLabel[p.status] || p.status}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/edit-property/${p.id}`)}>
                          <Pencil className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteProperty(p.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>السكن المشترك ({shared.length})</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {shared.length === 0 ? <p className="text-muted-foreground text-sm">لا توجد عروض</p> :
                  shared.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{s.title}</p>
                        <p className="text-sm text-muted-foreground">{s.location} - {s.price.toLocaleString()} ج.س</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant[s.status]}>{statusLabel[s.status] || s.status}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => deleteShared(s.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
