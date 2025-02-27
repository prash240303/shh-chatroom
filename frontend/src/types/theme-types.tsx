export type ThemeColors = 'Orange' | 'Blue' | 'Green' | 'Rose' | 'Zinc';

export interface ThemeColorStateParams {
  themeColor: ThemeColors;
  setThemeColor: React.Dispatch<React.SetStateAction<ThemeColors>>;
}
