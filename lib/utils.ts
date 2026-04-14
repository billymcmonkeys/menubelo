import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MEAL_SLOTS = ["desayuno", "almuerzo", "merienda", "cena"] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

export const DAY_LABELS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

export function formatQuantity(quantity: number): string {
  if (Number.isInteger(quantity)) return quantity.toString();
  return parseFloat(quantity.toFixed(2)).toString();
}
