export type ListingKind = "property" | "shared" | "dormitory";
export interface Listing {
  id: string;
  kind: ListingKind;
  title: string;
  location: string;
  price: number;
  property_type: string;
  currency?: string;
  rental_period?: string;
  description?: string | null;
  video_url?: string | null;
  created_at?: string;
  user_id?: string;
  images?: { image_url: string }[];
  advertiser?: { full_name: string; role: string } | null;
  gender?: string;
  available_spots?: number;
  beds_per_room?: number;
  meals_included?: boolean;
  nearby_university?: string | null;
  phone_number?: string | null;
}
export interface DiscoveryFilters {
  location: string;
  type: string;
  min: string;
  max: string;
  currency: string;
  gender: string;
  meals: string;
  query: string;
}
export const emptyFilters: DiscoveryFilters = { location: "", type: "all", min: "", max: "", currency: "SDG", gender: "all", meals: "all", query: "" };
export const listingKey = (item: Pick<Listing, "id" | "kind">) => `${item.kind}:${item.id}`;
export function matchesListing(item: Listing, filters: DiscoveryFilters) {
  const location = filters.location.trim().toLowerCase();
  const query = filters.query.trim().toLowerCase();
  if (location && !item.location.toLowerCase().includes(location)) return false;
  if (query && !`${item.title} ${item.location}`.toLowerCase().includes(query)) return false;
  if (filters.type !== "all" && filters.type !== item.property_type && filters.type !== item.kind) return false;
  const hasBudget = filters.min !== "" || filters.max !== "";
  if (hasBudget && (item.currency || "SDG") !== filters.currency) return false;
  if (filters.min !== "" && item.price < Number(filters.min)) return false;
  if (filters.max !== "" && item.price > Number(filters.max)) return false;
  if (filters.gender !== "all" && item.gender !== filters.gender) return false;
  if (filters.meals !== "all" && item.meals_included !== (filters.meals === "yes")) return false;
  return true;
}
export function toggleSaved(keys: string[], key: string) {
  return keys.includes(key) ? keys.filter(value => value !== key) : [...keys, key];
}
export const currencyLabel = (currency?: string) => currency === "USD" ? "دولار" : "ج.س";
export const periodLabel = (period?: string) => period === "يومي" ? "يومياً" : period === "أسبوعي" ? "أسبوعياً" : "شهرياً";