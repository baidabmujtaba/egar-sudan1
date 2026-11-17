import { Link, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FixedAddProperty() {
  const { pathname } = useLocation();
  const visible = ["/", "/index", "/properties", "/shared-housing", "/dormitories", "/favorites"].includes(pathname) || pathname.startsWith("/property/");
  if (!visible) return null;
  return <Button asChild size="lg" className="add-property-action fixed right-4 z-40 h-12 gap-2 rounded-full px-6 font-bold shadow-lg md:right-6">
    <Link to="/add-property" aria-label="أضف عقارك"><Plus className="!h-5 !w-5" />أضف عقارك</Link>
  </Button>;
}