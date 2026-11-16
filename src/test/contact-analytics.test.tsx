import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PropertyCard from "@/components/PropertyCard";
import PropertyDetails from "@/pages/PropertyDetails";

const state = vi.hoisted(() => ({
  signedIn: true,
  profileLoaded: true,
  role: "tenant",
  contact: "0912345678" as string | null,
  property: {
    id: "test-property",
    title: "Test listing",
    location: "Test location",
    description: "Private description",
    price: 250000,
    currency: "SDG",
    rental_period: "شهري",
    property_type: "شقة",
    phone_number: "0912345678",
    property_images: [],
    video_url: null,
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: state.signedIn ? { id: "test-visitor" } : null,
    profile: state.profileLoaded ? { role: state.role } : null,
    loading: false,
  }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: state.property, isLoading: false, isError: false }),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { phone_number: state.contact } }) }) }) }),
  },
}));
vi.mock("@/hooks/use-discovery", () => ({ useDiscovery: () => ({ data: [] }) }));
vi.mock("@/components/Navbar", () => ({ default: () => null }));
vi.mock("@/components/FavoriteButton", () => ({ default: () => null }));
vi.mock("@/components/ListingImage", () => ({ default: () => null }));

const eventName = "project.advertiser_contact_clicked";
const track = vi.fn(() => null);
const preventLinkNavigation = (event: MouseEvent) => {
  if (event.target instanceof Element && event.target.closest("a")) event.preventDefault();
};

function renderDetails() {
  return render(<MemoryRouter initialEntries={["/property/test-property"]}>
    <Routes>
      <Route path="/property/:id" element={<PropertyDetails />} />
      <Route path="/login" element={<div>Signed out</div>} />
    </Routes>
  </MemoryRouter>);
}

async function renderCard(kind: "shared" | "dormitory" = "shared") {
  render(<MemoryRouter><PropertyCard id="test-housing" kind={kind} title="Test housing" location="Private location" price={150000} property_type="سكن مشترك" /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: /^Test housing/ }));
  await screen.findByRole("dialog");
  if (state.signedIn && state.contact) {
    await waitFor(() => expect(screen.getByRole("link", { name: "اتصال" })).toHaveAttribute("href", "tel:0912345678"));
  }
}

beforeEach(() => {
  state.signedIn = true;
  state.profileLoaded = true;
  state.role = "tenant";
  state.contact = "0912345678";
  state.property.phone_number = "0912345678";
  track.mockClear();
  window.__lovableEvents = { track };
  window.scrollTo = vi.fn();
  document.addEventListener("click", preventLinkNavigation);
});

afterEach(() => {
  cleanup();
  delete window.__lovableEvents;
  document.removeEventListener("click", preventLinkNavigation);
});

describe("advertiser contact intent", () => {
  it("tracks one phone click from a housing card", async () => {
    await renderCard();
    expect(track).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("link", { name: "اتصال" }));
    expect(track.mock.calls).toEqual([[eventName, { channel: "phone", source: "card", listing_kind: "shared", viewer_role: "tenant" }]]);
  });

  it("tracks one WhatsApp click from a housing card", async () => {
    await renderCard();
    fireEvent.click(screen.getByRole("link", { name: "واتساب" }));
    expect(track.mock.calls).toEqual([[eventName, { channel: "whatsapp", source: "card", listing_kind: "shared", viewer_role: "tenant" }]]);
  });

  it("tracks one phone click from property details", () => {
    renderDetails();
    expect(track).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("link", { name: "اتصال بالمعلن" }));
    expect(track.mock.calls).toEqual([[eventName, { channel: "phone", source: "details", listing_kind: "property", viewer_role: "tenant" }]]);
  });

  it("tracks one WhatsApp click from property details", () => {
    renderDetails();
    fireEvent.click(screen.getByRole("link", { name: "واتساب المعلن" }));
    expect(track.mock.calls).toEqual([[eventName, { channel: "whatsapp", source: "details", listing_kind: "property", viewer_role: "tenant" }]]);
  });

  it("distinguishes dormitory contacts from shared housing", async () => {
    await renderCard("dormitory");
    fireEvent.click(screen.getByRole("link", { name: "اتصال" }));
    expect(track).toHaveBeenCalledWith(eventName, { channel: "phone", source: "card", listing_kind: "dormitory", viewer_role: "tenant" });
  });

  it("distinguishes non-tenant visits without sending their identity", () => {
    state.role = "owner";
    renderDetails();
    fireEvent.click(screen.getByRole("link", { name: "اتصال بالمعلن" }));
    expect(track).toHaveBeenCalledWith(eventName, { channel: "phone", source: "details", listing_kind: "property", viewer_role: "owner" });
  });

  it("marks the viewer role unknown until the profile is available", () => {
    state.profileLoaded = false;
    renderDetails();
    fireEvent.click(screen.getByRole("link", { name: "واتساب المعلن" }));
    expect(track).toHaveBeenCalledWith(eventName, { channel: "whatsapp", source: "details", listing_kind: "property", viewer_role: "unknown" });
  });

  it("excludes support calls and WhatsApp clicks", () => {
    renderDetails();
    fireEvent.click(screen.getByRole("link", { name: "اتصال بالدعم" }));
    fireEvent.click(screen.getByRole("link", { name: "واتساب الدعم" }));
    expect(track).not.toHaveBeenCalled();
  });

  it("never emits a contact when property details require signing in", () => {
    state.signedIn = false;
    renderDetails();
    expect(track).not.toHaveBeenCalled();
    expect(screen.getByText("Signed out")).toBeInTheDocument();
  });

  it("does not count missing card phone numbers even if a disabled link receives a click", async () => {
    state.contact = null;
    await renderCard();
    fireEvent.click(screen.getByRole("link", { name: "اتصال" }));
    fireEvent.click(screen.getByRole("link", { name: "واتساب" }));
    expect(track).not.toHaveBeenCalled();
  });

  it("does not emit when a property phone number is unavailable", () => {
    state.property.phone_number = "";
    renderDetails();
    expect(track).not.toHaveBeenCalled();
    expect(screen.queryByRole("link", { name: "اتصال بالمعلن" })).not.toBeInTheDocument();
  });

  it.each(["absent global", "absent method"])("preserves contact links with %s", (runtime) => {
    if (runtime === "absent global") delete window.__lovableEvents;
    else window.__lovableEvents = {};
    renderDetails();
    const phone = screen.getByRole("link", { name: "اتصال بالمعلن" });
    const whatsapp = screen.getByRole("link", { name: "واتساب المعلن" });
    expect(() => { fireEvent.click(phone); fireEvent.click(whatsapp); }).not.toThrow();
    expect(phone).toHaveAttribute("href", "tel:0912345678");
    expect(whatsapp.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/249912345678\?text=/);
    expect(track).not.toHaveBeenCalled();
  });
});