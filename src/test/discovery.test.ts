import { describe, expect, it } from "vitest";
import { emptyFilters, matchesListing, toggleSaved, listingKey, type Listing } from "@/lib/discovery";
import { discoveryCategories } from "@/lib/discovery-categories";

const apartment: Listing = { id: "apt", kind: "property", title: "شقة", location: "أم درمان الحتانة", price: 250000, currency: "SDG", property_type: "شقة" };
describe("actual listing filters", () => {
  it("offers buildings instead of the general properties category", () => {
    const values = discoveryCategories.map(category => category.value);
    expect(values.filter(value => value === "عمارة")).toHaveLength(1);
    expect(values).not.toContain("property");
    const filters = { ...emptyFilters, type: "عمارة" };
    expect(matchesListing({ ...apartment, property_type: "عمارة" }, filters)).toBe(true);
    expect(matchesListing(apartment, filters)).toBe(false);
    expect(matchesListing({ ...apartment, kind: "shared", property_type: "سكن مشترك" }, filters)).toBe(false);
  });
  it("does not offer commercial shops as a discovery filter", () => {
    expect(discoveryCategories.map(category => category.value)).not.toContain("محل تجاري");
  });
  it("does not offer offices as a discovery filter", () => {
    expect(discoveryCategories.map(category => category.value)).not.toContain("مكتب");
  });
  it.each(["شقة", "منزل أرضي", "عمارة", "فيلا", "استوديو", "غرفة"])("filters %s by its exact stored type", type => {
    const filters = { ...emptyFilters, type };
    expect(matchesListing({ ...apartment, property_type: type }, filters)).toBe(true);
    expect(matchesListing({ ...apartment, property_type: "مكتب" }, filters)).toBe(false);
  });
  it("combines building type, location and budget without admitting other types", () => {
    const building = { ...apartment, property_type: "عمارة" };
    const filters = { ...emptyFilters, type: "عمارة", location: "أم درمان", min: "200000", max: "300000" };
    expect(matchesListing(building, filters)).toBe(true);
    expect(matchesListing({ ...building, price: 300001 }, filters)).toBe(false);
    expect(matchesListing({ ...building, location: "كافوري" }, filters)).toBe(false);
    expect(matchesListing(apartment, filters)).toBe(false);
  });
  it("matches the selected location and excludes other locations", () => {
    expect(matchesListing(apartment, { ...emptyFilters, location: "أم درمان" })).toBe(true);
    expect(matchesListing(apartment, { ...emptyFilters, location: "كافوري" })).toBe(false);
  });
  it("matches apartment categories and excludes houses", () => {
    expect(matchesListing(apartment, { ...emptyFilters, type: "شقة" })).toBe(true);
    expect(matchesListing(apartment, { ...emptyFilters, type: "منزل أرضي" })).toBe(false);
  });
  it("keeps the properties category separate from shared housing and dormitories", () => {
    const filters = { ...emptyFilters, type: "property" };
    expect(matchesListing(apartment, filters)).toBe(true);
    expect(matchesListing({ ...apartment, kind: "shared", property_type: "سكن مشترك" }, filters)).toBe(false);
    expect(matchesListing({ ...apartment, kind: "dormitory", property_type: "داخلية" }, filters)).toBe(false);
  });
  it("includes exact budget boundaries and excludes out-of-range prices", () => {
    expect(matchesListing(apartment, { ...emptyFilters, min: "250000", max: "250000" })).toBe(true);
    expect(matchesListing(apartment, { ...emptyFilters, max: "249999" })).toBe(false);
    expect(matchesListing(apartment, { ...emptyFilters, min: "250001" })).toBe(false);
  });
  it("does not compare dollars with Sudanese pounds", () => {
    expect(matchesListing({ ...apartment, currency: "USD" }, { ...emptyFilters, max: "250000" })).toBe(false);
    expect(matchesListing({ ...apartment, currency: "USD" }, { ...emptyFilters, currency: "USD", max: "250000" })).toBe(true);
  });
  it("filters shared housing by actual gender and dormitories by meals", () => {
    const shared: Listing = { ...apartment, kind: "shared", gender: "female" };
    expect(matchesListing(shared, { ...emptyFilters, type: "shared", gender: "female" })).toBe(true);
    expect(matchesListing(shared, { ...emptyFilters, gender: "male" })).toBe(false);
    expect(matchesListing({ ...shared, meals_included: false }, { ...emptyFilters, meals: "yes" })).toBe(false);
  });
});
describe("favorites", () => {
  it("adds and removes the selected listing without duplicates", () => {
    expect(toggleSaved([], "property:apt")).toEqual(["property:apt"]);
    expect(toggleSaved(["property:apt", "shared:other"], "property:apt")).toEqual(["shared:other"]);
  });
  it("separates housing types with the same identifier", () => {
    expect(listingKey(apartment)).not.toBe(listingKey({ ...apartment, kind: "shared" }));
  });
});