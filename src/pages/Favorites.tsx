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
  return <div className="min-h-screen bg-background"><Navbar /><main className="container py-8"><h1 className="mb-2 text-2xl font-bold">المفضلة</h1><p className="mb-8 text-sm text-muted-foreground">محفوظة على هذا الجهاز</p>
    {isLoading ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map(i => <div key={i} className="aspect-square animate-pulse rounded-[24px] bg-secondary" />)}</div> : isError ? <div className="py-16 text-center"><p className="mb-4">تعذر تحميل المفضلة</p><Button variant="outline" onClick={() => refetch()}>إعادة المحاولة</Button></div> : items.length ? <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map(item => <PropertyCard {...item} key={listingKey(item)} />)}</div> : <div className="py-16 text-center"><Heart className="mx-auto mb-4 h-10 w-10 text-primary" /><h2 className="mb-5 text-lg font-semibold">لا توجد عقارات محفوظة بعد</h2><Button asChild className="rounded-full"><Link to="/">استكشف الإيجارات</Link></Button></div>}
  </main></div>;
}