"use client"

import * as React from "react"
import { ThemeColors } from '@/types/theme-types'
import {setGlobalColorTheme} from "@/lib/theme-colors"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  themeColor: ThemeColors
  setThemeColor: (color: ThemeColors) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  themeColor: "Zinc",
  setThemeColor: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [themeColor, setThemeColor] = React.useState<ThemeColors>(
    () => (localStorage.getItem("themeColor") as ThemeColors) || "Zinc"
  )

  React.useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      setGlobalColorTheme(systemTheme, themeColor)
    } else {
      root.classList.add(theme)
      setGlobalColorTheme(theme, themeColor)
    }
  }, [theme, themeColor])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    themeColor,
    setThemeColor: (color: ThemeColors) => {
      localStorage.setItem("themeColor", color)
      setThemeColor(color)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
