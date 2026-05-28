"use client";

import { useTheme } from "./ThemeProvider";
import { StarfieldCanvas } from "./StarfieldCanvas";
import { Starfield3D } from "./Starfield3D";
import { useState } from "react";

export function StarfieldWrapper() {
  const { starfield } = useTheme();
  const [mode] = useState<"2d" | "3d">("3d");

  if (mode === "3d") {
    return <Starfield3D enabled={starfield} />;
  }
  return <StarfieldCanvas enabled={starfield} />;
}
