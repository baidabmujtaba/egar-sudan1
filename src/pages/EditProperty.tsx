import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

export default function EditProperty() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [video, setVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", price: "", location: "", description: "", phone_number: "", property_type: "شقة", currency: "SDG",
  });

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id || !user) return;
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        toast.error("لم يتم العثور على العقار");
        navigate("/dashboard");
        return;
      }

      setForm({
        title: data.title,
        price: String(data.price),
        location: data.location,
        description: data.description || "",
        phone_number: data.phone_number,
        property_type: data.property_type,
        currency: data.currency || "SDG",
      });
      setVideoUrl((data as any).video_url || null);
      setFetching(false);
    };
    fetchProperty();
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setLoading(true);
    try {
      let newVideoUrl = videoUrl;
      if (video) {
        if (video.size > 50 * 1024 * 1024) {
          toast.error("حجم الفيديو يجب أن يكون أقل من 50 ميجا");
          setLoading(false);
          return;
        }
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${video.name}`;
        const { error: upErr } = await supabase.storage.from("property-images").upload(fileName, video);
        if (upErr) throw upErr;
        newVideoUrl = supabase.storage.from("property-images").getPublicUrl(fileName).data.publicUrl;
      }
      const { error } = await supabase
        .from("properties")
        .update({
          title: form.title,
          price: Number(form.price),
          location: form.location,
          description: form.description,
          phone_number: form.phone_number,
          property_type: form.property_type,
          currency: form.currency,
          video_url: newVideoUrl,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("تم تحديث العقار بنجاح");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء تحديث العقار");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>تعديل العقار</CardTitle>
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
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
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
                <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
                <Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الوصف</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">فيديو العقار (اختياري - حتى 50 ميجا)</label>
                {videoUrl && !video && (
                  <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/40">
                    <span className="text-sm text-muted-foreground">يوجد فيديو حالياً</span>
                    <button type="button" onClick={() => setVideoUrl(null)} className="p-1 rounded hover:bg-destructive/10">
                      <X className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                )}
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
                    <span>{videoUrl ? "استبدال الفيديو" : "اضغط لرفع فيديو"}</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => setVideo(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />جاري التحديث...</> : "حفظ التعديلات"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>إلغاء</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
