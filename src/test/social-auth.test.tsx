import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import SocialSignIn from "@/components/SocialSignIn";
import { authReturnKey, safeAuthReturn } from "@/lib/auth-return";

const oauth = vi.hoisted(() => vi.fn());
vi.mock("@/integrations/lovable", () => ({ lovable: { auth: { signInWithOAuth: oauth } } }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
afterEach(() => { cleanup(); sessionStorage.clear(); oauth.mockReset(); });

describe("social sign-in", () => {
  it.each(["google", "apple"] as const)("starts %s using a public same-origin callback", async provider => {
    oauth.mockResolvedValue({ redirected: true, error: null });
    render(<SocialSignIn destination="/property/example" />);
    fireEvent.click(screen.getByRole("button", { name: provider === "google" ? "المتابعة مع Google" : "Continue with Apple" }));
    await waitFor(() => expect(oauth).toHaveBeenCalledWith(provider, { redirect_uri: `${window.location.origin}/auth/callback` }));
    expect(sessionStorage.getItem(authReturnKey)).toBe("/property/example");
    expect(oauth).toHaveBeenCalledTimes(1);
  });
  it("clears a pending destination after a rejected provider request", async () => {
    oauth.mockResolvedValue({ error: new Error("Cancelled") });
    render(<SocialSignIn destination="/dashboard" />);
    fireEvent.click(screen.getByRole("button", { name: "المتابعة مع Google" }));
    await waitFor(() => expect(sessionStorage.getItem(authReturnKey)).toBeNull());
  });
  it.each(["https://external.example", "//external.example", "/\\external.example", "/login", "/auth/callback"])("rejects unsafe or recursive return %s", value => {
    expect(safeAuthReturn(value)).toBe("/");
  });
  it("preserves a local property destination", () => {
    expect(safeAuthReturn("/property/example?view=gallery")).toBe("/property/example?view=gallery");
  });
});