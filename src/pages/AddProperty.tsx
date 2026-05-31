import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUpload from "@/components/ImageUpload";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Loader2, Video, X } from "lucide-react";

export default function AddProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "", price: "", location: "", description: "", phone_number: "", property_type: "شقة", currency: "SDG", rental_period: "شهري",
  });

  const uploadImage = async (file: File): Promise<string> => {
    if (!user) throw new Error("Not authenticated");
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
    const { error } = await supabase.storage.from("property-images").upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from("property-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

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
        videoUrl = await uploadImage(video);
      }
      const { data: property, error } = await supabase
        .from("properties")
        .insert({
          title: form.title,
          price: Number(form.price),
          location: form.location,
          description: form.description,
          phone_number: form.phone_number,
          property_type: form.property_type,
          currency: form.currency,
          rental_period: form.rental_period,
          user_id: user.id,
          status: "pending",
          video_url: videoUrl,
        })
        .select()
        .single();

      if (error) throw error;

      for (const file of images) {
        const url = await uploadImage(file);
        await supabase.from("property_images").insert({
          property_id: property.id,
          image_url: url,
        });
      }

      toast.success("تم إضافة العقار بنجاح! سيتم مراجعته من الإدارة.");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Add property error:", err);
      toast.error(err.message || "حدث خطأ أثناء إضافة العقار");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>إضافة عقار جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">عنوان العقار</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">السعر</label>
                <div className="flex gap-2">
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="flex-1" />
                  <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SDG">ج.س</SelectItem>
                      <SelectItem value="USD">دولار</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الموقع</label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نوع العقار</label>
                <Select value={form.property_type} onValueChange={(v) => setForm({ ...form, property_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="شقة">شقة</SelectItem>
                    <SelectItem value="عمارة">عمارة</SelectItem>
                    <SelectItem value="شاغر">شاغر</SelectItem>
                    <SelectItem value="منزل أرضي">منزل أرضي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">مدة الإيجار</label>
                <Select value={form.rental_period} onValueChange={(v) => setForm({ ...form, rental_period: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="يومي">يومي</SelectItem>
                    <SelectItem value="أسبوعي">أسبوعي</SelectItem>
                    <SelectItem value="شهري">شهري</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
                <Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الوصف</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <ImageUpload files={images} onChange={setImages} />
              <div className="space-y-2">
                <label className="block text-sm font-medium">فيديو للعقار (اختياري - حتى 50 ميجا)</label>
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
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => setVideo(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />جاري الإضافة...</> : "إضافة العقار"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
