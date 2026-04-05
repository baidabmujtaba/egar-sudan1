import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone } from "lucide-react";

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  property_type: string;
  phone_number: string;
  images?: { image_url: string }[];
}

export default function PropertyCard({ id, title, price, location, property_type, phone_number, images }: PropertyCardProps) {
  const firstImage = images?.[0]?.image_url;

  return (
    <Link to={`/property/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {firstImage ? (
            <img src={firstImage} alt={title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">لا توجد صورة</div>
          )}
          <Badge className="absolute top-2 right-2">{property_type}</Badge>
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-bold text-lg line-clamp-1">{title}</h3>
          <p className="text-2xl font-bold text-primary">{price.toLocaleString()} ج.س</p>
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
    </Link>
  );
}
