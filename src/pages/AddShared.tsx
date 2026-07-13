import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Loader2, Video, X } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

export default function AddShared() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [video, setVideo] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: "", price: "", location: "", description: "", phone_number: "", gender: "male", available_spots: "1",
  });

  const uploadFile = async (file: File) => {
    const name = `${user!.id}/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
    const { error } = await supabase.storage.from("property-images").upload(name, file);
    if (error) throw error;
    return supabase.storage.from("property-images").getPublicUrl(name).data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("يجب تسجيل الدخول أولاً");
    setLoading(true);
    try {
      let videoUrl: string | null = null;
      if (video) {
        if (video.size > 50 * 1024 * 1024) { toast.error("حجم الفيديو يجب أن يكون أقل من 50 ميجا"); setLoading(false); return; }
        videoUrl = await uploadFile(video);
      }
      const { data: inserted, error } = await supabase.from("shared_housing").insert({
        title: form.title,
        price: Number(form.price),
        location: form.location,
        description: form.description,
        phone_number: form.phone_number,
        gender: form.gender,
        available_spots: Number(form.available_spots),
        user_id: user.id,
        status: "pending",
        video_url: videoUrl,
      }).select("id").single();
      if (error) throw error;

      if (images.length && inserted?.id) {
        const urls = await Promise.all(images.map(uploadFile));
        const rows = urls.map(u => ({ shared_housing_id: inserted.id, image_url: u }));
        const { error: imgErr } = await supabase.from("shared_housing_images").insert(rows);
        if (imgErr) console.error(imgErr);
      }

      toast.success("تم إضافة السكن المشترك! سيتم مراجعته.");
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
          <CardHeader><CardTitle>إضافة سكن مشترك</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">العنوان</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><label className="block text-sm font-medium mb-1">السعر (ج.س)</label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
              <div><label className="block text-sm font-medium mb-1">الموقع</label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></div>
              <div>
                <label className="block text-sm font-medium mb-1">الجنس</label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ذكور</SelectItem>
                    <SelectItem value="female">إناث</SelectItem>
                    <SelectItem value="mixed">مختلط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><label className="block text-sm font-medium mb-1">الأماكن المتاحة</label><Input type="number" min="1" value={form.available_spots} onChange={(e) => setForm({ ...form, available_spots: e.target.value })} required /></div>
              <div><label className="block text-sm font-medium mb-1">رقم الهاتف</label><Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} required /></div>
              <div><label className="block text-sm font-medium mb-1">الوصف</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>

              <ImageUpload files={images} onChange={setImages} maxFiles={5} />

              <div className="space-y-2">
                <label className="block text-sm font-medium">فيديو السكن (اختياري - حتى 50 ميجا)</label>
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
                {loading ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />جاري الإضافة...</> : "إضافة السكن المشترك"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}