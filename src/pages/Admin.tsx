import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Check, Trash2, Eye, Pencil, Users, Home, Building2, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Admin() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [shared, setShared] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [images, setImages] = useState<Record<string, string[]>>({});
  const [previewProp, setPreviewProp] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
      return;
    }
  }, [isAdmin, authLoading]);

  const fetchAll = async () => {
    const [{ data: p }, { data: s }, { data: u }, { data: imgs }] = await Promise.all([
      supabase.from("properties").select("*").order("created_at", { ascending: false }),
      supabase.from("shared_housing").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("property_images").select("property_id,image_url"),
    ]);
    setProperties(p || []);
    setShared(s || []);
    setUsers(u || []);
    const map: Record<string, string[]> = {};
    (imgs || []).forEach((r: any) => {
      (map[r.property_id] ||= []).push(r.image_url);
    });
    setImages(map);
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

  const roleCount = (r: string) => users.filter(u => u.role === r).length;
  const tenants = roleCount("tenant");
  const owners = roleCount("owner");
  const brokers = roleCount("broker");
  const admins = roleCount("admin");

  // last 14 days signups (proxy for visitors / growth)
  const days: { day: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
    const count = users.filter(u => (u.created_at || "").slice(0, 10) === key).length;
    days.push({ day: label, count });
  }
  const last7 = days.slice(-7).reduce((a, b) => a + b.count, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 space-y-6">
        <h1 className="text-2xl font-bold">لوحة الإدارة</h1>

        {/* Overall stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{users.length}</p><p className="text-sm text-muted-foreground">إجمالي المستخدمين</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{last7}</p><p className="text-sm text-muted-foreground">زوار جدد (7 أيام)</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{properties.length + shared.length}</p><p className="text-sm text-muted-foreground">إجمالي الإعلانات</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-warning">{pendingProps.length + pendingShared.length}</p><p className="text-sm text-muted-foreground">بانتظار الموافقة</p></CardContent></Card>
        </div>

        {/* Roles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-4 flex items-center gap-3"><Users className="h-6 w-6 text-primary" /><div><p className="text-xl font-bold">{tenants}</p><p className="text-xs text-muted-foreground">مستأجرين</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><Home className="h-6 w-6 text-primary" /><div><p className="text-xl font-bold">{owners}</p><p className="text-xs text-muted-foreground">ملاك</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><Building2 className="h-6 w-6 text-primary" /><div><p className="text-xl font-bold">{brokers}</p><p className="text-xs text-muted-foreground">وسطاء</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><UserCheck className="h-6 w-6 text-primary" /><div><p className="text-xl font-bold">{admins}</p><p className="text-xs text-muted-foreground">إداريين</p></div></CardContent></Card>
        </div>

        {/* Visitors chart */}
        <Card>
          <CardHeader><CardTitle className="text-base">نمو المستخدمين خلال آخر 14 يوم</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Tabs defaultValue="properties" dir="rtl">
          <TabsList className="w-full">
            <TabsTrigger value="pending" className="flex-1">بانتظار المراجعة ({pendingProps.length})</TabsTrigger>
            <TabsTrigger value="properties" className="flex-1">العقارات</TabsTrigger>
            <TabsTrigger value="shared" className="flex-1">السكن المشترك</TabsTrigger>
            <TabsTrigger value="users" className="flex-1">المستخدمين</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {pendingProps.length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد عقارات قيد المراجعة</p>}
            {pendingProps.map(p => {
              const imgs = images[p.id] || [];
              return (
                <Card key={p.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex gap-3 overflow-x-auto">
                      {imgs.slice(0, 5).map((u, i) => (
                        <img key={i} src={(await import("@/lib/image")).thumb ? u : u} alt={p.title} loading="lazy" decoding="async" className="h-24 w-32 object-cover rounded-md flex-shrink-0" />
                      ))}
                      {imgs.length === 0 && <div className="h-24 w-32 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">لا صور</div>}
                      {p.video_url && (
                        <video src={p.video_url} className="h-24 w-32 object-cover rounded-md flex-shrink-0" controls />
                      )}
                    </div>
                    <div>
                      <p className="font-bold">{p.title}</p>
                      <p className="text-sm text-muted-foreground">{p.property_type} • {p.location} • {p.price?.toLocaleString()} {p.currency || "ج.س"}</p>
                      <p className="text-sm mt-1 line-clamp-2">{p.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPreviewProp({ ...p, _images: imgs })}>
                        <Eye className="h-4 w-4 ml-1" /> معاينة كاملة
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/edit-property/${p.id}`)}>
                        <Pencil className="h-4 w-4 ml-1" /> تعديل
                      </Button>
                      <Button size="sm" onClick={() => approveProperty(p.id)}>
                        <Check className="h-4 w-4 ml-1" /> موافقة
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteProperty(p.id)}>
                        <Trash2 className="h-4 w-4 ml-1" /> رفض
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

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
                  <Button variant="ghost" size="icon" onClick={() => navigate(`/edit-property/${p.id}`)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
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

        <Dialog open={!!previewProp} onOpenChange={(o) => !o && setPreviewProp(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            {previewProp && (
              <>
                <DialogHeader>
                  <DialogTitle>{previewProp.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {(previewProp._images || []).map((u: string, i: number) => (
                      <img key={i} src={u} alt="" className="w-full h-40 object-cover rounded-md" />
                    ))}
                  </div>
                  {previewProp.video_url && (
                    <video src={previewProp.video_url} controls className="w-full rounded-md" />
                  )}
                  <div className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">النوع:</span> {previewProp.property_type}</p>
                    <p><span className="text-muted-foreground">الموقع:</span> {previewProp.location}</p>
                    <p><span className="text-muted-foreground">السعر:</span> {previewProp.price?.toLocaleString()} {previewProp.currency || "ج.س"} / {previewProp.rental_period}</p>
                    <p><span className="text-muted-foreground">الهاتف:</span> {previewProp.phone_number}</p>
                    <p className="whitespace-pre-wrap pt-2">{previewProp.description}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => { approveProperty(previewProp.id); setPreviewProp(null); }}>
                      <Check className="h-4 w-4 ml-1" /> موافقة
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/edit-property/${previewProp.id}`)}>
                      <Pencil className="h-4 w-4 ml-1" /> تعديل
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
