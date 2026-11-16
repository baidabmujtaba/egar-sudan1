import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import DiscoverySearch from "@/components/DiscoverySearch";
import { emptyFilters } from "@/lib/discovery";

afterEach(cleanup);

describe("search category switching", () => {
  it("clears housing-only constraints when switching to buildings", () => {
    const onApply = vi.fn();
    render(<DiscoverySearch filters={{ ...emptyFilters, type: "dormitory", gender: "female", meals: "yes", location: "أم درمان" }} onApply={onApply} locations={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "ابحث عن إيجارك" }));
    fireEvent.click(screen.getByRole("button", { name: "عمارات" }));
    fireEvent.submit(screen.getByRole("button", { name: "بحث" }).closest("form") as HTMLFormElement);
    expect(onApply).toHaveBeenCalledWith({ ...emptyFilters, type: "عمارة", location: "أم درمان", gender: "all", meals: "all" });
  });
  it("does not apply an inverted price range", () => {
    const onApply = vi.fn();
    render(<DiscoverySearch filters={emptyFilters} onApply={onApply} locations={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "ابحث عن إيجارك" }));
    fireEvent.change(screen.getByLabelText("من"), { target: { value: "300000" } });
    fireEvent.change(screen.getByLabelText("إلى"), { target: { value: "200000" } });
    fireEvent.submit(screen.getByRole("button", { name: "بحث" }).closest("form") as HTMLFormElement);
    expect(onApply).not.toHaveBeenCalled();
  });
});