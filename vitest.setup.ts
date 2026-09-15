import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import React from "react";

process.env.AUTH_SECRET = process.env.AUTH_SECRET ?? "test-secret-please-change-0123456789";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill: _fill, priority: _priority, sizes: _sizes, ...rest } = props as Record<string, unknown> & { fill?: boolean; priority?: boolean; sizes?: string };
    void _fill;
    void _priority;
    void _sizes;
    return React.createElement("img", rest as React.ImgHTMLAttributes<HTMLImageElement>);
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));
