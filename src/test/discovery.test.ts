import { describe, expect, it } from "vitest";
import { emptyFilters, matchesListing, toggleSaved, listingKey, type Listing } from "@/lib/discovery";

const apartment: Listing = { id: "apt", kind: "property", title: "شقة", location: "أم درمان الحتانة", price: 250000, currency: "SDG", property_type: "شقة" };
describe("actual listing filters", () => {
  it("matches the selected location and excludes other locations", () => {
    expect(matchesListing(apartment, { ...emptyFilters, location: "أم درمان" })).toBe(true);
    expect(matchesListing(apartment, { ...emptyFilters, location: "كافوري" })).toBe(false);
  });
  it("matches apartment categories and excludes houses", () => {
    expect(matchesListing(apartment, { ...emptyFilters, type: "شقة" })).toBe(true);
    expect(matchesListing(apartment, { ...emptyFilters, type: "منزل أرضي" })).toBe(false);
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