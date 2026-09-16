// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@/lib/i18n/provider";
import { getDictionary } from "@/lib/i18n";
import { PaintExplorer } from "@/components/vehicles/paint-explorer";
import { getVehicle } from "@/data/vehicles";

describe("PaintExplorer", () => {
  it("switches the selected paint and shows its price", () => {
    const v = getVehicle("xiaomi-su7")!;
    render(
      <LocaleProvider locale="zh" dictionary={getDictionary("zh")}>
        <PaintExplorer paints={v.paints} wheels={v.wheels} interiors={v.interiors} />
      </LocaleProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "赤霞红" }));
    expect(screen.getByRole("button", { name: "赤霞红" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/金属漆 · \+¥7,000/)).toBeInTheDocument();
  });
});
