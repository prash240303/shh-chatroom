type ThemeColors = 'Orange' | 'Blue' | 'Green' | 'Rose' | 'Zinc';

const themes = {
  Orange: {
    light: {
      background: "0 0% 100%",
      foreground: "24.6 95% 15%", // darker orange-tinted text for good contrast
      card: "0 0% 100%",
      cardForeground: "24.6 95% 15%",
      popover: "0 0% 100%",
      popoverForeground: "24.6 95% 15%",
      primary: "24.6 95% 53.1%",
      primaryForeground: "60 9.1% 97.8%",
      secondary: "60 4.8% 95.9%",
      secondaryForeground: "24.6 95% 15%",
      muted: "60 4.8% 95.9%",
      mutedForeground: "25 5.3% 44.7%",
      accent: "24.6 95% 90%", // light orange accent background
      accentForeground: "24.6 95% 25%", // readable orange text
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "60 9.1% 97.8%",
      border: "20 5.9% 90%",
      input: "20 5.9% 90%",
      ring: "24.6 95% 53.1%",
      radius: "0.5rem",
    },
    dark: {
      background: "20 14.3% 4.1%",
      foreground: "60 9.1% 97.8%",
      card: "20 14.3% 4.1%",
      cardForeground: "60 9.1% 97.8%",
      popover: "20 14.3% 4.1%",
      popoverForeground: "60 9.1% 97.8%",
      primary: "20.5 90.2% 48.2%",
      primaryForeground: "60 9.1% 97.8%",
      secondary: "12 6.5% 15.1%",
      secondaryForeground: "60 9.1% 97.8%",
      muted: "12 6.5% 15.1%",
      mutedForeground: "24 5.4% 63.9%",
      accent: "24.6 95% 25%", // darker orange accent for dark bg
      accentForeground: "60 9.1% 97.8%",
      destructive: "0 72.2% 50.6%",
      destructiveForeground: "60 9.1% 97.8%",
      border: "12 6.5% 15.1%",
      input: "12 6.5% 15.1%",
      ring: "20.5 90.2% 48.2%",
    },
  },

  Blue: {
    light: {
      background: "0 0% 100%",
      foreground: "222.2 84% 10%",
      card: "0 0% 100%",
      cardForeground: "222.2 84% 10%",
      popover: "0 0% 100%",
      popoverForeground: "222.2 84% 10%",
      primary: "221.2 83.2% 53.3%",
      primaryForeground: "210 40% 98%",
      secondary: "210 40% 96.1%",
      secondaryForeground: "222.2 47.4% 11.2%",
      muted: "210 40% 96.1%",
      mutedForeground: "215.4 16.3% 46.9%",
      accent: "221.2 83.2% 92%", // soft blue accent bg
      accentForeground: "221.2 83.2% 25%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "210 40% 98%",
      border: "214.3 31.8% 91.4%",
      input: "214.3 31.8% 91.4%",
      ring: "221.2 83.2% 53.3%",
      radius: "0.5rem",
    },
    dark: {
      background: "222.2 84% 4.9%",
      foreground: "210 40% 98%",
      card: "222.2 84% 4.9%",
      cardForeground: "210 40% 98%",
      popover: "222.2 84% 4.9%",
      popoverForeground: "210 40% 98%",
      primary: "217.2 91.2% 59.8%",
      primaryForeground: "222.2 47.4% 11.2%",
      secondary: "217.2 32.6% 17.5%",
      secondaryForeground: "210 40% 98%",
      muted: "217.2 32.6% 17.5%",
      mutedForeground: "215 20.2% 65.1%",
      accent: "221.2 83.2% 30%", // darker accent for dark bg
      accentForeground: "210 40% 98%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "210 40% 98%",
      border: "217.2 32.6% 17.5%",
      input: "217.2 32.6% 17.5%",
      ring: "224.3 76.3% 48%",
    },
  },

  Green: {
    light: {
      background: "0 0% 100%",
      foreground: "142.1 76.2% 15%",
      card: "0 0% 100%",
      cardForeground: "142.1 76.2% 15%",
      popover: "0 0% 100%",
      popoverForeground: "142.1 76.2% 15%",
      primary: "142.1 76.2% 36.3%",
      primaryForeground: "355.7 100% 97.3%",
      secondary: "240 4.8% 95.9%",
      secondaryForeground: "142.1 76.2% 15%",
      muted: "240 4.8% 95.9%",
      mutedForeground: "240 3.8% 46.1%",
      accent: "142.1 76.2% 90%",
      accentForeground: "142.1 76.2% 20%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "240 5.9% 90%",
      input: "240 5.9% 90%",
      ring: "142.1 76.2% 36.3%",
      radius: "0.5rem",
    },
    dark: {
      background: "20 14.3% 4.1%",
      foreground: "0 0% 95%",
      card: "24 9.8% 10%",
      cardForeground: "0 0% 95%",
      popover: "0 0% 9%",
      popoverForeground: "0 0% 95%",
      primary: "142.1 70.6% 45.3%",
      primaryForeground: "144.9 80.4% 10%",
      secondary: "240 3.7% 15.9%",
      secondaryForeground: "0 0% 98%",
      muted: "0 0% 15%",
      mutedForeground: "240 5% 64.9%",
      accent: "142.1 70.6% 25%",
      accentForeground: "0 0% 98%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "0 85.7% 97.3%",
      border: "240 3.7% 15.9%",
      input: "240 3.7% 15.9%",
      ring: "142.4 71.8% 29.2%",
    },
  },

  Rose: {
    light: {
      background: "0 0% 100%",
      foreground: "346.8 77.2% 15%",
      card: "0 0% 100%",
      cardForeground: "346.8 77.2% 15%",
      popover: "0 0% 100%",
      popoverForeground: "346.8 77.2% 15%",
      primary: "346.8 77.2% 49.8%",
      primaryForeground: "355.7 100% 97.3%",
      secondary: "240 4.8% 95.9%",
      secondaryForeground: "346.8 77.2% 15%",
      muted: "240 4.8% 95.9%",
      mutedForeground: "240 3.8% 46.1%",
      accent: "346.8 77.2% 92%",
      accentForeground: "346.8 77.2% 25%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "240 5.9% 90%",
      input: "240 5.9% 90%",
      ring: "346.8 77.2% 49.8%",
      radius: "0.5rem",
    },
    dark: {
      background: "20 14.3% 4.1%",
      foreground: "0 0% 95%",
      card: "24 9.8% 10%",
      cardForeground: "0 0% 95%",
      popover: "0 0% 9%",
      popoverForeground: "0 0% 95%",
      primary: "346.8 77.2% 49.8%",
      primaryForeground: "355.7 100% 97.3%",
      secondary: "240 3.7% 15.9%",
      secondaryForeground: "0 0% 98%",
      muted: "0 0% 15%",
      mutedForeground: "240 5% 64.9%",
      accent: "346.8 77.2% 25%",
      accentForeground: "0 0% 98%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "0 85.7% 97.3%",
      border: "240 3.7% 15.9%",
      input: "240 3.7% 15.9%",
      ring: "346.8 77.2% 49.8%",
    },
  },

  Zinc: {
    light: {
      background: "0 0% 100%",
      foreground: "240 10% 10%",
      card: "0 0% 100%",
      cardForeground: "240 10% 10%",
      popover: "0 0% 100%",
      popoverForeground: "240 10% 10%",
      primary: "240 5.9% 10%",
      primaryForeground: "0 0% 98%",
      secondary: "240 4.8% 95.9%",
      secondaryForeground: "240 5.9% 10%",
      muted: "240 4.8% 95.9%",
      mutedForeground: "240 3.8% 46.1%",
      accent: "240 4.8% 95.9%", // light neutral accent
      accentForeground: "240 5.9% 15%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "240 5.9% 90%",
      input: "240 5.9% 90%",
      ring: "240 5.9% 10%",
      radius: "0.5rem",
    },
    dark: {
      background: "240 10% 3.9%",        // Deepest dark
      foreground: "0 0% 98%",            // Bright white text
      card: "240 8% 8%",                 // Slightly elevated dark
      cardForeground: "0 0% 98%",
      popover: "240 9% 6%",              // Between background and card
      popoverForeground: "0 0% 98%",
      primary: "0 0% 98%",               // Bright accent
      primaryForeground: "240 5.9% 10%",
      secondary: "240 5% 18%",           // Medium-dark gray
      secondaryForeground: "0 0% 98%",
      muted: "240 4% 12%",               // Subtle dark gray
      mutedForeground: "240 5% 64.9%",
      accent: "240 6% 22%",              // Lighter dark for hover states
      accentForeground: "0 0% 98%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "0 0% 98%",
      border: "240 4% 16%",              // Visible but subtle borders
      input: "240 5% 14%",               // Input field background
      ring: "240 4.9% 83.9%",
    },
  },
};

export function setGlobalColorTheme(
  themeMode: "light" | "dark",
  color: ThemeColors,
) {
  const theme = themes[color][themeMode] as Record<string, string>;

  for (const key in theme) {
    document.documentElement.style.setProperty(`--${key}`, theme[key]);
  }
  
  // Store the current color theme
  localStorage.setItem('colorTheme', color);
}

export function getGlobalColorTheme(): ThemeColors | null {
  const stored = localStorage.getItem('colorTheme');
  return (stored as ThemeColors) || null;
}