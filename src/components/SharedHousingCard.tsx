import PropertyCard from "@/components/PropertyCard";
import type { Listing } from "@/lib/discovery";
type Props = Omit<Listing, "kind" | "property_type"> & { shared_housing_images?: { image_url: string }[] };
export default function SharedHousingCard({ shared_housing_images, ...props }: Props) { return <PropertyCard {...props} kind="shared" property_type="سكن مشترك" images={shared_housing_images} />; }
