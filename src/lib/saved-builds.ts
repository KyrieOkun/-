"use client";

import { useCallback, useEffect, useState } from "react";
import type { VehicleSelection } from "@/data/types";

export const SAVED_BUILDS_KEY = "mta:saved-configs";
const MAX_SAVED = 20;
const EVENT = "mta:saved-configs-changed";

export interface SavedBuild {
  id: string;
  vehicle: string;
  selection: VehicleSelection;
  total: number;
  savedAt: string;
}

function isSavedBuild(value: unknown): value is SavedBuild {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.vehicle === "string" && typeof v.total === "number" && typeof v.savedAt === "string" && !!v.selection && typeof v.selection === "object";
}

export function readSavedBuilds(): SavedBuild[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(SAVED_BUILDS_KEY) ?? "[]") as unknown;
    if (!Array.isArray(raw)) return [];
    // Older entries were written without an id; derive a stable one.
    return raw.filter(isSavedBuild).map((b, i) => ({ ...b, id: b.id ?? `${b.vehicle}-${b.savedAt}-${i}` }));
  } catch {
    return [];
  }
}

function writeSavedBuilds(builds: SavedBuild[]) {
  window.localStorage.setItem(SAVED_BUILDS_KEY, JSON.stringify(builds.slice(0, MAX_SAVED)));
  window.dispatchEvent(new Event(EVENT));
}

export function saveBuild(entry: Omit<SavedBuild, "id" | "savedAt">): SavedBuild {
  const build: SavedBuild = { ...entry, id: `${entry.vehicle}-${Date.now().toString(36)}`, savedAt: new Date().toISOString() };
  // Replace an identical configuration instead of stacking duplicates.
  const rest = readSavedBuilds().filter((b) => !(b.vehicle === build.vehicle && JSON.stringify(b.selection) === JSON.stringify(build.selection)));
  writeSavedBuilds([build, ...rest]);
  return build;
}

export function removeBuild(id: string) {
  writeSavedBuilds(readSavedBuilds().filter((b) => b.id !== id));
}

export function useSavedBuilds(vehicleSlug?: string) {
  const [builds, setBuilds] = useState<SavedBuild[]>([]);
  const refresh = useCallback(() => {
    const all = readSavedBuilds();
    setBuilds(vehicleSlug ? all.filter((b) => b.vehicle === vehicleSlug) : all);
  }, [vehicleSlug]);

  useEffect(() => {
    refresh();
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return { builds, refresh, remove: removeBuild };
}
