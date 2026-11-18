import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AddProperty from "@/pages/AddProperty";
import AdminPayments from "@/components/AdminPayments";

const state = vi.hoisted(() => ({
  auth: { user: null as { id: string } | null, loading: false },
  from: vi.fn(),
  rpc: vi.fn(),
  select: vi.fn(),
  limit: vi.fn(),
  maybeSingle: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => state.auth }));
vi.mock("@/components/Navbar", () => ({ default: () => null }));
vi.mock("@/components/ImageUpload", () => ({ default: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: state.from, rpc: state.rpc } }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const settings = {
  id: "test-payment-settings",
  bank_name: "Test bank",
  account_number: "TEST-ACCOUNT",
  account_name: "Test account holder",
  listing_price: 100,
  currency: "SDG",
  instructions: "Test payment instructions",
  payment_required: false,
};

function submission() {
  return <MemoryRouter initialEntries={["/add-property"]}>
    <Routes>
      <Route path="/add-property" element={<AddProperty />} />
      <Route path="/register" element={<div>Sign up required</div>} />
    </Routes>
  </MemoryRouter>;
}

beforeEach(() => {
  state.auth = { user: null, loading: false };
  const query = {
    select: state.select, limit: state.limit, maybeSingle: state.maybeSingle,
    update: state.update, eq: state.eq,
  };
  state.from.mockReturnValue(query);
  state.rpc.mockReturnValue(query);
  state.select.mockReturnValue(query);
  state.limit.mockReturnValue(query);
  state.update.mockReturnValue(query);
  state.maybeSingle.mockResolvedValue({ data: settings, error: null });
  state.eq.mockResolvedValue({ error: null });
});

afterEach(() => { cleanup(); vi.resetAllMocks(); });

describe("payment settings access", () => {
  it("redirects visitors without requesting payment settings", async () => {
    render(submission());
    await screen.findByText("Sign up required");
    expect(state.from).not.toHaveBeenCalled();
    expect(state.rpc).not.toHaveBeenCalled();
    expect(screen.queryByText("TEST-ACCOUNT")).not.toBeInTheDocument();
  });

  it("waits for sign-in to resolve before requesting payment settings", async () => {
    state.auth = { user: { id: "test-member" }, loading: true };
    const view = render(submission());
    expect(state.from).not.toHaveBeenCalled();
    expect(state.rpc).not.toHaveBeenCalled();

    state.auth.loading = false;
    view.rerender(submission());
    await screen.findByText("TEST-ACCOUNT");
    expect(state.rpc).toHaveBeenCalledExactlyOnceWith("get_listing_payment_instructions");
    expect(state.from).not.toHaveBeenCalled();
  });

  it("preserves payment instructions and optional receipt settings for signed-in submitters", async () => {
    state.auth.user = { id: "test-member" };
    render(submission());
    await screen.findByText("Test payment instructions");
    expect(screen.getByText("الدفع عبر Test bank")).toBeInTheDocument();
    expect(screen.getByText("TEST-ACCOUNT")).toBeInTheDocument();
    expect(screen.getByText("صورة إشعار الدفع (اختياري)")).toBeInTheDocument();
    expect(state.rpc).toHaveBeenCalledExactlyOnceWith("get_listing_payment_instructions");
    expect(state.select).not.toHaveBeenCalled();
  });

  it("removes payment details when the member signs out", async () => {
    state.auth.user = { id: "test-member" };
    const view = render(submission());
    await screen.findByText("TEST-ACCOUNT");
    state.auth.user = null;
    view.rerender(submission());
    await screen.findByText("Sign up required");
    expect(screen.queryByText("TEST-ACCOUNT")).not.toBeInTheDocument();
    expect(state.rpc).toHaveBeenCalledTimes(1);
  });

  it("ignores payment responses belonging to a previous session", async () => {
    let resolvePrevious!: (value: { data: typeof settings; error: null }) => void;
    state.maybeSingle.mockImplementationOnce(() => new Promise(resolve => { resolvePrevious = resolve; }));
    state.auth.user = { id: "first-member" };
    const view = render(submission());
    state.auth.user = { id: "second-member" };
    view.rerender(submission());
    await screen.findByText("TEST-ACCOUNT");
    await act(async () => {
      resolvePrevious({ data: { ...settings, account_number: "STALE-ACCOUNT" }, error: null });
    });
    await waitFor(() => expect(screen.queryByText("STALE-ACCOUNT")).not.toBeInTheDocument());
    expect(screen.getByText("TEST-ACCOUNT")).toBeInTheDocument();
  });

  it("preserves the existing administrator payment-editing flow", async () => {
    render(<AdminPayments properties={[]} onApprove={vi.fn()} onReject={vi.fn()} />);
    await screen.findByDisplayValue("Test bank");
    fireEvent.click(screen.getByRole("button", { name: "حفظ الإعدادات" }));
    await waitFor(() => expect(state.eq).toHaveBeenCalledWith("id", settings.id));
    expect(state.update).toHaveBeenCalledWith({
      bank_name: settings.bank_name,
      account_number: settings.account_number,
      account_name: settings.account_name,
      listing_price: settings.listing_price,
      currency: settings.currency,
      instructions: settings.instructions,
      payment_required: settings.payment_required,
    });
  });
});