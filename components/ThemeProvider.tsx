"use client";

import { ThemeProvider as MTThemeProvider } from "@material-tailwind/react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <MTThemeProvider>{children}</MTThemeProvider>;
}
