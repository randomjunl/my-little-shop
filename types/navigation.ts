import type { Category } from "@/payload-types";

export type NavigationCategory = Pick<Category, "id" | "name" | "slug">;

export interface NavigationItem {
    href: string;
    label: string;
}