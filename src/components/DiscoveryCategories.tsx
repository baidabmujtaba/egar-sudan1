import { Button } from "@/components/ui/button";
import { discoveryCategories } from "@/lib/discovery-categories";

export default function DiscoveryCategories({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <nav className="category-track scrollbar-none flex items-center gap-2.5 overflow-x-auto" aria-label="فئات العقارات">
    {discoveryCategories.map(category => <Button key={category.value} variant="category" className={category.value === "shared" ? "text-warning" : ""} aria-pressed={value === category.value} onClick={() => onChange(category.value)}>
      <img src={category.image} alt="" width={36} height={36} className="h-8 w-8 shrink-0 object-contain" loading="lazy" />
      <span>{category.label}</span>
    </Button>)}
  </nav>;
}