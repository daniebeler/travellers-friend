import { Settings } from "./Settings";

export type Category = {
  key: CategoryType;
  label: string;
  color: string; // Tailwind class for the category color
};

export type CategoryType =
  | 'toilets'
  | 'water'
  | 'bike'
  | 'atm'
  | 'pingpong'
  | 'fitness';
