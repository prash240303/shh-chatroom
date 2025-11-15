export type ThemeColors = 'Orange' | 'Ocean' | 'Green' | 'Rose' | 'Zinc';

export interface ThemeColorStateParams {
  themeColor: ThemeColors;
  setThemeColor: React.Dispatch<React.SetStateAction<ThemeColors>>;
}
