import type { Category } from "@/payload-types";
import Link from "next/link";

interface Props {
    category: Category;
    subcategories: Category[];
    isOpen: boolean;
    position: { top: number; left: number };
}

export const SubcategoryMenu = ({ category, subcategories, isOpen, position }: Props) => {
    if (!isOpen || subcategories.length === 0) return null;

    const backgroundColor = category.id || "#F5F5F5";
    return (
        <div
            className="fixed z-50 w-60 overflow-hidden rounded-md border shadow-lg"
            style={{
                top: position.top,
                left: position.left,
                backgroundColor
            }}
        >
            <div className="flex flex-col p-2 text-black">
                {subcategories.map((subcategory) => (
                    <Link
                        key={subcategory.id}
                        href={`/category/${subcategory.id}`}
                        className="rounded px-3 py-2 text-sm hover:bg-white/70"
                    >
                        {subcategory.name}
                    </Link>
                ))}
            </div>

        </div>
    );
};
