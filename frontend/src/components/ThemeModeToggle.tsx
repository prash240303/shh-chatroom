import { Moon, Sun } from "lucide-react"
import { Button } from "./ui/button"
import { useTheme } from "@/context/theme-provider"

export function ThemeModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="border-primary/10 bg-muted-secondary hover:bg-primary/10"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] text-primary rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] text-primary rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}