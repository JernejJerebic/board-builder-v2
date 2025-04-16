export interface Color {
  id: number;
  name: string;
  htmlColor: string;
  active: boolean;
  imageUrl?: string;
  darkShadow?: string; // Added for dark mode board visualization
}
