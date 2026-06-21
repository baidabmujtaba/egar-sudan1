import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Loader2, Video, X } from "lucide-react";

export default function AddDormitory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [video, setVideo] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "", price: "", location: "", description: "", phone_number: "",
    gender: "male", beds_per_room: "2", available_spots: "1",
    meals_included: false, nearby_university: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("يجب تسجيل الدخول أولاً");
    setLoading(true);
    try {
      let videoUrl: string | null = null;
      if (video) {
        if (video.size > 50 * 1024 * 1024) {
          toast.error("حجم الفيديو يجب أن يكون أقل من 50 ميجا");
          setLoading(false);
          return;
        }
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}-${video.name}`;
        const { error: upErr } = await supabase.storage.from("property-images").upload(fileName, video);
        if (upErr) throw upErr;
        videoUrl = supabase.storage.from("property-images").getPublicUrl(fileName).data.publicUrl;
      }
      const { error } = await supabase.from("dormitories").insert({
        title: form.title,
        price: Number(form.price),
        location: form.location,
        description: form.description,
        phone_number: form.phone_number,
        gender: form.gender,
        beds_per_room: Number(form.beds_per_room),
        available_spots: Number(form.available_spots),
        meals_included: form.meals_included,
        nearby_university: form.nearby_university || null,
        user_id: user.id,
        status: "pending",
        video_url: videoUrl,
      });
      if (error) throw error;
      toast.success("تم إضافة الداخلية! سيتم مراجعتها.");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-lg">
        <Card>
          <CardHeader><CardTitle>إضافة داخلية طلابية</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">اسم الداخلية</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><label className="block text-sm font-medium mb-1">السعر الشهري (ج.س)</label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
              <div><label className="block text-sm font-medium mb-1">الموقع</label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></div>
              <div><label className="block text-sm font-medium mb-1">الجامعة/المعهد القريب</label><Input value={form.nearby_university} onChange={(e) => setForm({ ...form, nearby_university: e.target.value })} placeholder="مثال: جامعة الخرطوم" /></div>
              <div>
                <label className="block text-sm font-medium mb-1">النوع</label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ذكور</SelectItem>
                    <SelectItem value="female">إناث</SelectItem>
                    <SelectItem value="mixed">مختلط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium mb-1">أسرّة/غرفة</label><Input type="number" min="1" value={form.beds_per_room} onChange={(e) => setForm({ ...form, beds_per_room: e.target.value })} required /></div>
                <div><label className="block text-sm font-medium mb-1">الأماكن المتاحة</label><Input type="number" min="1" value={form.available_spots} onChange={(e) => setForm({ ...form, available_spots: e.target.value })} required /></div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <label className="text-sm font-medium">الوجبات مشمولة</label>
                <Switch checked={form.meals_included} onCheckedChange={(v) => setForm({ ...form, meals_included: v })} />
              </div>
              <div><label className="block text-sm font-medium mb-1">رقم الهاتف</label><Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} required /></div>
              <div><label className="block text-sm font-medium mb-1">الوصف</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">فيديو الداخلية (اختياري - حتى 50 ميجا)</label>
                {video ? (
                  <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/40">
                    <div className="flex items-center gap-2 min-w-0">
                      <Video className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm truncate">{video.name}</span>
                    </div>
                    <button type="button" onClick={() => setVideo(null)} className="p-1 rounded hover:bg-destructive/10">
                      <X className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 cursor-pointer hover:border-primary transition-colors text-sm text-muted-foreground">
                    <Video className="h-5 w-5" />
                    <span>اضغط لرفع فيديو</span>
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => setVideo(e.target.files?.[0] || null)} />
                  </label>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />جاري الإضافة...</> : "إضافة الداخلية"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}