import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Check, X, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [shared, setShared] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
      return;
    }
  }, [isAdmin, authLoading]);

  const fetchAll = async () => {
    const [{ data: p }, { data: s }, { data: u }] = await Promise.all([
      supabase.from("properties").select("*").order("created_at", { ascending: false }),
      supabase.from("shared_housing").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);
    setProperties(p || []);
    setShared(s || []);
    setUsers(u || []);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) fetchAll(); }, [isAdmin]);

  const approveProperty = async (id: string) => {
    await supabase.from("properties").update({ status: "approved" }).eq("id", id);
    toast.success("تمت الموافقة");
    fetchAll();
  };

  const deleteProperty = async (id: string) => {
    await supabase.from("properties").delete().eq("id", id);
    toast.success("تم الحذف");
    fetchAll();
  };

  const approveShared = async (id: string) => {
    await supabase.from("shared_housing").update({ status: "approved" }).eq("id", id);
    toast.success("تمت الموافقة");
    fetchAll();
  };

  const deleteShared = async (id: string) => {
    await supabase.from("shared_housing").delete().eq("id", id);
    toast.success("تم الحذف");
    fetchAll();
  };

  const statusLabel: Record<string, string> = { pending: "قيد المراجعة", approved: "مقبول" };

  if (authLoading || loading) return <div className="min-h-screen bg-background"><Navbar /><div className="text-center py-20 text-muted-foreground">جاري التحميل...</div></div>;

  const pendingProps = properties.filter(p => p.status === "pending");
  const pendingShared = shared.filter(s => s.status === "pending");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 space-y-6">
        <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{properties.length}</p><p className="text-sm text-muted-foreground">عقارات</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-warning">{pendingProps.length}</p><p className="text-sm text-muted-foreground">بانتظار الموافقة</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{shared.length}</p><p className="text-sm text-muted-foreground">سكن مشترك</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{users.length}</p><p className="text-sm text-muted-foreground">مستخدمين</p></CardContent></Card>
        </div>

        <Tabs defaultValue="properties" dir="rtl">
          <TabsList className="w-full">
            <TabsTrigger value="properties" className="flex-1">العقارات</TabsTrigger>
            <TabsTrigger value="shared" className="flex-1">السكن المشترك</TabsTrigger>
            <TabsTrigger value="users" className="flex-1">المستخدمين</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-3 mt-4">
            {properties.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-muted-foreground">{p.location} - {p.price.toLocaleString()} ج.س</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.status === "pending" ? "secondary" : "default"}>{statusLabel[p.status]}</Badge>
                  {p.status === "pending" && (
                    <Button variant="ghost" size="icon" onClick={() => approveProperty(p.id)}>
                      <Check className="h-4 w-4 text-success" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => deleteProperty(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="shared" className="space-y-3 mt-4">
            {shared.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.location} - {s.price.toLocaleString()} ج.س</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.status === "pending" ? "secondary" : "default"}>{statusLabel[s.status]}</Badge>
                  {s.status === "pending" && (
                    <Button variant="ghost" size="icon" onClick={() => approveShared(s.id)}>
                      <Check className="h-4 w-4 text-success" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => deleteShared(s.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="users" className="space-y-3 mt-4">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{u.full_name}</p>
                  <p className="text-sm text-muted-foreground">{u.phone_number}</p>
                </div>
                <Badge>{u.role}</Badge>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
