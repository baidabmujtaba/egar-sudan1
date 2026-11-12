import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Listing } from "@/lib/discovery";

// Explicit public columns avoid requesting protected contact or payment data.
const common = "id,title,price,location,description,video_url,created_at,user_id";
async function properties(): Promise<Listing[]> {
  const rows: Listing[] = [];
  for (let from = 0; ; from += 100) {
    const { data, error } = await supabase.from("properties")
      .select(`${common},property_type,currency,rental_period,property_images(image_url)`)
      .eq("status", "approved").order("created_at", { ascending: false }).order("id").range(from, from + 99);
    if (error) throw error;
    const page = (data || []) as unknown as (Listing & { property_images: { image_url: string }[] })[];
    rows.push(...page.map(p => ({ ...p, kind: "property" as const, images: p.property_images })));
    if (page.length < 100) break;
  }
  return rows;
}
async function shared(): Promise<Listing[]> {
  const rows: Listing[] = [];
  for (let from = 0; ; from += 100) {
    const { data, error } = await supabase.from("shared_housing")
      .select(`${common},gender,available_spots,shared_housing_images(image_url)`)
      .eq("status", "approved").order("created_at", { ascending: false }).order("id").range(from, from + 99);
    if (error) throw error;
    const page = (data || []) as unknown as (Listing & { shared_housing_images: { image_url: string }[] })[];
    rows.push(...page.map(p => ({ ...p, kind: "shared" as const, property_type: "سكن مشترك", images: p.shared_housing_images })));
    if (page.length < 100) break;
  }
  return rows;
}
async function dormitories(): Promise<Listing[]> {
  const rows: Listing[] = [];
  for (let from = 0; ; from += 100) {
    const { data, error } = await supabase.from("dormitories")
      .select(`${common},gender,available_spots,beds_per_room,meals_included,nearby_university,dormitory_images(image_url)`)
      .eq("status", "approved").order("created_at", { ascending: false }).order("id").range(from, from + 99);
    if (error) throw error;
    const page = (data || []) as unknown as (Listing & { dormitory_images: { image_url: string }[] })[];
    rows.push(...page.map(p => ({ ...p, kind: "dormitory" as const, property_type: "داخلية", images: p.dormitory_images })));
    if (page.length < 100) break;
  }
  return rows;
}
export function useDiscovery() {
  return useQuery({ queryKey: ["discovery"], queryFn: async () => {
    const groups = await Promise.all([properties(), shared(), dormitories()]);
    const listings = groups.flat().sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    const userIds = [...new Set(listings.map(p => p.user_id).filter((id): id is string => Boolean(id)))];
    if (!userIds.length) return listings;
    const { data } = await supabase.rpc("get_advertisers", { _user_ids: userIds });
    const advertisers = new Map((data || []).map(p => [p.user_id, p]));
    return listings.map(p => ({ ...p, advertiser: advertisers.get(p.user_id || "") || null }));
  } });
}