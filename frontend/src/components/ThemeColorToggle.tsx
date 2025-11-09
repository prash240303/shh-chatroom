import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/theme-provider"
import type { ThemeColors } from "@/types/theme-types"

const availableThemeColors: Array<{
  name: ThemeColors
  light: string
  dark: string
}> = [
  { name: "Zinc", light: "bg-zinc-900", dark: "bg-zinc-700" },
  { name: "Rose", light: "bg-rose-600", dark: "bg-rose-700" },
  { name: "Blue", light: "bg-blue-600", dark: "bg-blue-700" },
  { name: "Green", light: "bg-green-600", dark: "bg-green-500" },
  { name: "Orange", light: "bg-orange-500", dark: "bg-orange-700" },
]

export function ThemeColorToggle() {
  const { themeColor, setThemeColor, theme } = useTheme()
  const currentTheme =
    theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme

  return (
    <Select value={themeColor} onValueChange={(value) => setThemeColor(value as ThemeColors)}>
      <SelectTrigger className="flex-1 text-primary ring-primary/50 ring-offset-background focus:ring-primary border-border hover:border-primary/50 transition-colors">
        <SelectValue placeholder="Select Color" />
      </SelectTrigger>
      <SelectContent className="border-border bg-popover">
        {availableThemeColors.map(({ name, light, dark }) => (
          <SelectItem 
            key={name} 
            value={name}
            className="focus:bg-accent focus:text-accent-foreground cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className={cn("rounded-full w-[20px] h-[20px] border-2 border-border", currentTheme === "light" ? light : dark)} />
              <div className="text-sm text-foreground">{name}</div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}