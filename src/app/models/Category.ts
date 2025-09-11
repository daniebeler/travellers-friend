import { Settings } from "./Settings";

export type Category = {
  key: keyof Settings;
  label: string;
  color: string; // Tailwind class for the category color
};