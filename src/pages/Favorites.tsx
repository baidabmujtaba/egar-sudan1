import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { useDiscovery } from "@/hooks/use-discovery";
import { useFavorites } from "@/hooks/use-favorites";
import { listingKey } from "@/lib/discovery";

export default function Favorites() {
  const { keys } = useFavorites();
  const { data = [], isLoading, isError, refetch } = useDiscovery();
  const items = data.filter(item => keys.includes(listingKey(item)));
  return <div className="discovery-page min-h-screen"><Navbar /><main className="discovery-container py-8"><h1 className="mb-2 text-2xl font-bold">المفضلة</h1><p className="mb-8 text-sm text-muted-foreground">محفوظة على هذا الجهاز</p>
    {isLoading ? <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">{[0,1,2,3].map(i => <div key={i} className="listing-photo listing-photo-compact animate-pulse bg-secondary" />)}</div> : isError ? <div className="py-16 text-center"><p className="mb-4">تعذر تحميل المفضلة</p><Button variant="outline" onClick={() => refetch()}>إعادة المحاولة</Button></div> : items.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:gap-x-5 lg:grid-cols-3 xl:grid-cols-4">{items.map(item => <PropertyCard {...item} compact key={listingKey(item)} />)}</div> : <div className="py-16 text-center"><Heart className="mx-auto mb-4 h-10 w-10 text-primary" /><h2 className="mb-5 text-lg font-semibold">لا توجد عقارات محفوظة بعد</h2><Button asChild className="rounded-full"><Link to="/">استكشف الإيجارات</Link></Button></div>}
  </main></div>;
}