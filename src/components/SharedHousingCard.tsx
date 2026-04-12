import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Users, MessageCircle, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SharedHousingCardProps {
  title: string;
  price: number;
  location: string;
  gender: string;
  available_spots: number;
  phone_number: string;
}

const genderLabel: Record<string, string> = { male: "ذكور", female: "إناث", mixed: "مختلط" };
const genderColor: Record<string, string> = {
  male: "bg-blue-100 text-blue-700 border-blue-200",
  female: "bg-pink-100 text-pink-700 border-pink-200",
  mixed: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function SharedHousingCard({ title, price, location, gender, available_spots, phone_number }: SharedHousingCardProps) {
  const cleanPhone = phone_number.replace(/\s+/g, "");
  const waPhone = cleanPhone.startsWith("0") ? "249" + cleanPhone.slice(1) : cleanPhone;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in group border-0 shadow-md">
      {/* Top color bar */}
      <div className="h-1.5 bg-gradient-to-l from-primary to-primary/60" />
      
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base leading-snug line-clamp-2">{title}</h3>
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
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <a href={`tel:${cleanPhone}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full h-10 rounded-lg text-xs font-semibold">
              <Phone className="h-4 w-4 ml-1" />اتصال
            </Button>
          </a>
          <a href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`مرحباً، أستفسر عن السكن المشترك: ${title}\nالسعر: ${price.toLocaleString()} ج.س\nالموقع: ${location}`)}`} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="default" size="sm" className="w-full h-10 rounded-lg text-xs font-semibold">
              <MessageCircle className="h-4 w-4 ml-1" />واتساب
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
