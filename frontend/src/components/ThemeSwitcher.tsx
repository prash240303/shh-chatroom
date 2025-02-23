"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  const nextTheme = () => {
    if (resolvedTheme === "light") {
      setTheme("dark");
    } else if (resolvedTheme === "dark") {
      setTheme("hazel");
    } else {
      setTheme("light");
    }
  };

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2 border border-neutral-300 dark:border-neutral-700 hazel:border-hazel-border bg-neutral-100 dark:bg-neutral-800 hazel:bg-hazel hover:bg-neutral-200 dark:hover:bg-neutral-900 hazel:hover:bg-hazel/80"
      onClick={nextTheme}
    >
      {resolvedTheme === "light" ? <Moon /> : resolvedTheme === "dark" ? <Palette /> : <Sun />}
      {resolvedTheme === "light" ? "Dark" : resolvedTheme === "dark" ? "Hazel" : "Light"} Mode
    </Button>
  );
}
