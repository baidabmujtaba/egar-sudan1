import { Building2, Home, BedDouble, Store, BriefcaseBusiness, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import allImage from "@/assets/category-all.png";
import homesImage from "@/assets/category-homes.png";
import dormitoriesImage from "@/assets/category-dormitories.png";
import sharedImage from "@/assets/category-shared.png";

const mainCategories = [
  { value: "all", label: "الكل", image: allImage },
  { value: "property", label: "عقارات", image: homesImage },
  { value: "dormitory", label: "داخليات", image: dormitoriesImage },
  { value: "shared", label: "شواغر", image: sharedImage },
];
const propertyCategories = [
  { value: "شقة", label: "شقق", icon: Building2 },
  { value: "منزل أرضي", label: "منازل", icon: Home },
  { value: "فيلا", label: "فلل", icon: Warehouse },
  { value: "استوديو", label: "استوديو", icon: BedDouble },
  { value: "غرفة", label: "غرف", icon: BedDouble },
  { value: "عمارة", label: "عمارات", icon: Building2 },
  { value: "محل تجاري", label: "محلات", icon: Store },
  { value: "مكتب", label: "مكاتب", icon: BriefcaseBusiness },
];

export default function DiscoveryCategories({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <nav className="category-track scrollbar-none flex items-center gap-2.5 overflow-x-auto" aria-label="فئات العقارات">
    {mainCategories.map(category => <Button key={category.value} variant="category" className={category.value === "shared" ? "text-warning" : ""} aria-pressed={value === category.value} onClick={() => onChange(category.value)}>
      <img src={category.image} alt="" width={36} height={36} className="h-8 w-8 shrink-0 object-contain" loading="lazy" />
      <span>{category.label}</span>
    </Button>)}
    {propertyCategories.map(({ value: category, label, icon: Icon }) => <Button key={category} variant="category" aria-pressed={value === category} onClick={() => onChange(category)}><Icon className="!h-5 !w-5" /><span>{label}</span></Button>)}
  </nav>;
}