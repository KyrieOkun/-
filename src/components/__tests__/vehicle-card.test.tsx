// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { getVehicle } from "@/data/vehicles";

describe("VehicleCard", () => {
  it("renders name, price and range in Chinese", () => {
    render(<VehicleCard vehicle={getVehicle("xiaomi-su7")!} locale="zh" />);
    expect(screen.getByRole("heading", { name: "小米 SU7" })).toBeInTheDocument();
    expect(screen.getByText("21.99 万元")).toBeInTheDocument();
    expect(screen.getByText("902")).toBeInTheDocument();
  });
  it("renders overseas badge and learn-more CTA for Cybertruck in English", () => {
    render(<VehicleCard vehicle={getVehicle("tesla-cybertruck")!} locale="en" />);
    expect(screen.getByText("Overseas Model")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Learn More" }).length).toBeGreaterThan(0);
  });
});
