import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PropertyDetails from "@/pages/PropertyDetails";
import FixedAddProperty from "@/components/FixedAddProperty";

const state = vi.hoisted(() => ({ status: "approved", select: vi.fn(), eq: vi.fn(), filters: {} as Record<string, string> }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null, profile: null, loading: false }) }));
vi.mock("@/hooks/use-discovery", () => ({ useDiscovery: () => ({ data: [] }) }));
vi.mock("@/components/Navbar", () => ({ default: () => null }));
vi.mock("@/components/FavoriteButton", () => ({ default: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => {
  state.filters = {};
  const query = {
    select: state.select,
    eq: state.eq,
    maybeSingle: async () => ({ data: state.filters.status && state.filters.status !== state.status ? null : {
      id: "approved-property", title: "Public property", location: "Test location", price: 250000,
      property_type: "شقة", phone_number: "0912345678", property_images: [],
    }, error: null }),
  };
  state.select.mockReturnValue(query);
  state.eq.mockImplementation((key: string, value: string) => { state.filters[key] = value; return query; });
  return query;
} } }));

afterEach(() => { cleanup(); vi.clearAllMocks(); state.status = "approved"; });
function details() {
  window.scrollTo = vi.fn();
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter initialEntries={["/property/approved-property"]}><Routes><Route path="/property/:id" element={<PropertyDetails />} /></Routes></MemoryRouter>
  </QueryClientProvider>);
}

describe("public listing permissions", () => {
  it("loads approved advertiser details without a session and excludes payment receipts", async () => {
    details();
    await screen.findByRole("link", { name: "اتصال بالمعلن" });
    expect(state.eq).toHaveBeenCalledWith("status", "approved");
    const selected = state.select.mock.calls[0]?.[0] as string;
    expect(selected).toContain("phone_number");
    expect(selected).not.toContain("payment_receipt_url");
    expect(selected).not.toContain("*");
  });
  it.each(["pending", "rejected"])("keeps %s details inaccessible to visitors", async status => {
    state.status = status;
    details();
    await screen.findByText("العقار غير موجود");
    expect(screen.queryByRole("link", { name: "اتصال بالمعلن" })).not.toBeInTheDocument();
  });
  it("sends the fixed listing action to the existing protected submission flow", async () => {
    render(<MemoryRouter><Routes>
      <Route path="/" element={<FixedAddProperty />} />
      <Route path="/add-property" element={<div>Protected submission flow</div>} />
    </Routes></MemoryRouter>);
    fireEvent.click(screen.getByRole("link", { name: "أضف عقارك" }));
    await waitFor(() => expect(screen.getByText("Protected submission flow")).toBeInTheDocument());
  });
});