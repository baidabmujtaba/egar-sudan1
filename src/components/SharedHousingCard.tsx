import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Users } from "lucide-react";

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
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg">{title}</h3>
          <Badge variant="secondary">{genderLabel[gender] || gender}</Badge>
        </div>
        <p className="text-2xl font-bold text-primary">{price.toLocaleString()} ج.س</p>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{available_spots} أماكن متاحة</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{phone_number}</span>
        </div>
      </CardContent>
    </Card>
  );
}
