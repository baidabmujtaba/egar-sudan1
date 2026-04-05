import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone } from "lucide-react";

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("properties")
        .select("*, property_images(image_url)")
        .eq("id", id!)
        .single();
      setProperty(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="text-center py-20 text-muted-foreground">جاري التحميل...</div></div>;
  if (!property) return <div className="min-h-screen bg-background"><Navbar /><div className="text-center py-20 text-muted-foreground">العقار غير موجود</div></div>;

  const images = property.property_images || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 space-y-6 max-w-2xl">
        {/* Image gallery */}
        {images.length > 0 && (
          <div className="space-y-2">
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img src={images[activeImage]?.image_url} alt={property.title} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 ${i === activeImage ? "border-primary" : "border-transparent"}`}>
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold">{property.title}</h1>
            <Badge>{property.property_type}</Badge>
          </div>
          <p className="text-3xl font-bold text-primary">{property.price.toLocaleString()} ج.س</p>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" /><span>{property.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" /><span>{property.phone_number}</span>
          </div>
          {property.description && (
            <div>
              <h2 className="font-semibold mb-2">الوصف</h2>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
