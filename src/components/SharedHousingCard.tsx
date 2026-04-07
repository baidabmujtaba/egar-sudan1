import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Users, MessageCircle } from "lucide-react";
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

export default function SharedHousingCard({ title, price, location, gender, available_spots, phone_number }: SharedHousingCardProps) {
  const cleanPhone = phone_number.replace(/\s+/g, "");
  const waPhone = cleanPhone.startsWith("0") ? "249" + cleanPhone.slice(1) : cleanPhone;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg">{title}</h3>
          <Badge variant="secondary">{genderLabel[gender] || gender}</Badge>
        </div>
        <p className="text-2xl font-bold text-primary">{price.toLocaleString()} ج.س</p>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" /><span>{available_spots} أماكن متاحة</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" /><span>{location}</span>
        </div>
        <div className="flex gap-2 pt-1">
          <a href={`tel:${cleanPhone}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full"><Phone className="h-4 w-4 ml-1" />اتصال</Button>
          </a>
          <a href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`مرحباً، أستفسر عن السكن المشترك: ${title}\nالسعر: ${price.toLocaleString()} ج.س\nالموقع: ${location}`)}`} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="default" size="sm" className="w-full"><MessageCircle className="h-4 w-4 ml-1" />واتساب</Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
