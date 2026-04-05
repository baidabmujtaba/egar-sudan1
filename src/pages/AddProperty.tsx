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
import { Loader2 } from "lucide-react";

export default function AddProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: "", price: "", location: "", description: "", phone_number: "", property_type: "شقة",
  });

  const uploadImage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
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
      const { data: property, error } = await supabase
        .from("properties")
        .insert({
          title: form.title,
          price: Number(form.price),
          location: form.location,
          description: form.description,
          phone_number: form.phone_number,
          property_type: form.property_type,
          user_id: user.id,
          status: "pending",
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
                <label className="block text-sm font-medium mb-1">السعر (ج.س)</label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
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
                    <SelectItem value="منزل">منزل</SelectItem>
                    <SelectItem value="محل">محل تجاري</SelectItem>
                    <SelectItem value="مكتب">مكتب</SelectItem>
                    <SelectItem value="أرض">أرض</SelectItem>
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
