import { twMerge } from "tailwind-merge";
import type { ClassValue } from "tailwind-variants";
import { clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}