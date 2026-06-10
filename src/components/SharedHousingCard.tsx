import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, MessageCircle, Bed, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface SharedHousingCardProps {
  title: string;
  price: number;
  location: string;
  gender: string;
  available_spots: number;
  phone_number?: string | null;
  video_url?: string | null;
}

const genderLabel: Record<string, string> = { male: "ذكور", female: "إناث", mixed: "مختلط" };
const genderColor: Record<string, string> = {
  male: "bg-blue-100 text-blue-700 border-blue-200",
  female: "bg-pink-100 text-pink-700 border-pink-200",
  mixed: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function SharedHousingCard({ title, price, location, gender, available_spots, phone_number, video_url }: SharedHousingCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cleanPhone = (phone_number || "").replace(/\s+/g, "");
  const waPhone = cleanPhone.startsWith("0") ? "249" + cleanPhone.slice(1) : cleanPhone;
  const requireLogin = (e: React.MouseEvent) => {
    if (!user || !phone_number) {
      e.preventDefault();
      navigate("/login");
      return true;
    }
    return false;
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in group border-0 shadow-md">
      {/* Top color bar */}
      <div className="h-1.5 bg-gradient-to-l from-primary to-primary/60" />
      
      <CardContent className="p-5 space-y-4">
        {video_url && (
          <div className="rounded-lg overflow-hidden bg-black aspect-video">
            <video src={video_url} controls playsInline className="w-full h-full" preload="metadata" />
          </div>
        )}
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base leading-snug line-clamp-2 flex-1">{title}</h3>
          <Badge className={`shrink-0 text-[11px] px-2 py-0.5 border ${genderColor[gender] || "bg-secondary text-secondary-foreground"}`}>
            {genderLabel[gender] || gender}
          </Badge>
        </div>

        {/* Price */}
        <p className="text-2xl font-extrabold text-primary">{price.toLocaleString()} <span className="text-sm font-medium text-muted-foreground">ج.س / شهري</span></p>

        {/* Info chips */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs bg-muted/60 rounded-full px-3 py-1.5">
            <Bed className="h-3.5 w-3.5 text-primary" />
            <span>{available_spots} أماكن متاحة</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-muted/60 rounded-full px-3 py-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>{location}</span>
          </div>
          {video_url && (
            <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary rounded-full px-3 py-1.5">
              <Video className="h-3.5 w-3.5" />
              <span>فيديو</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <a href={user && phone_number ? `tel:${cleanPhone}` : "#"} className="flex-1" onClick={requireLogin}>
            <Button variant="outline" size="sm" className="w-full h-10 rounded-lg text-xs font-semibold">
              <Phone className="h-4 w-4 ml-1" />اتصال
            </Button>
          </a>
          <a href={user && phone_number ? `https://wa.me/${waPhone}?text=${encodeURIComponent(`مرحباً، أستفسر عن السكن المشترك: ${title}\nالسعر: ${price.toLocaleString()} ج.س\nالموقع: ${location}`)}` : "#"} target="_blank" rel="noopener noreferrer" className="flex-1" onClick={requireLogin}>
            <Button variant="default" size="sm" className="w-full h-10 rounded-lg text-xs font-semibold">
              <MessageCircle className="h-4 w-4 ml-1" />واتساب
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
