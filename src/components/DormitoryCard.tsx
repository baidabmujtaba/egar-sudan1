import PropertyCard from "@/components/PropertyCard";
import type { Listing } from "@/lib/discovery";
type Props = Omit<Listing, "kind" | "property_type"> & { dormitory_images?: { image_url: string }[] };
export default function DormitoryCard({ dormitory_images, ...props }: Props) { return <PropertyCard {...props} kind="dormitory" property_type="داخلية" images={dormitory_images} />; }
