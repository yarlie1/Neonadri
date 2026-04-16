"use client";

import { useEffect, useState } from "react";

export type DistanceUnit = "mi" | "km";

const DISTANCE_UNIT_STORAGE_KEY = "neonadri_distance_unit";
const DISTANCE_UNIT_EVENT = "neonadri-distance-unit-change";

function readDistanceUnit(): DistanceUnit {
  if (typeof window === "undefined") return "mi";

  const stored = window.localStorage.getItem(DISTANCE_UNIT_STORAGE_KEY);
  return stored === "km" ? "km" : "mi";
}

export function useDistanceUnit() {
  const [distanceUnit, setDistanceUnitState] = useState<DistanceUnit>("mi");

  useEffect(() => {
    setDistanceUnitState(readDistanceUnit());

    const sync = () => {
      setDistanceUnitState(readDistanceUnit());
    };

    window.addEventListener("storage", sync);
    window.addEventListener(DISTANCE_UNIT_EVENT, sync as EventListener);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(DISTANCE_UNIT_EVENT, sync as EventListener);
    };
  }, []);

  const setDistanceUnit = (nextUnit: DistanceUnit) => {
    setDistanceUnitState(nextUnit);
    window.localStorage.setItem(DISTANCE_UNIT_STORAGE_KEY, nextUnit);
    window.dispatchEvent(new Event(DISTANCE_UNIT_EVENT));
  };

  return {
    distanceUnit,
    setDistanceUnit,
  };
}

