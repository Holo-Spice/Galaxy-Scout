"use client";

import { useTheme } from "./ThemeProvider";
import { StarfieldCanvas } from "./StarfieldCanvas";

export function StarfieldWrapper() {
  const { starfield } = useTheme();
  return <StarfieldCanvas enabled={starfield} />;
}
