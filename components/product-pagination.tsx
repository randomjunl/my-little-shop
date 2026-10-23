import Link from "next/link";
import { PRODUCTS_PER_PAGE } from "@/lib/product-pagination";

interface Props {
    basePath: string;
    page: number;
    totalPages: number;
    totalDocs: number;
    filters?: Record<string, string>;
}

export function ProductPagination({ basePath, page, totalPages, totalDocs, filters = {} }: Props) {
    if (totalDocs === 0) return null;
    function pageHref(nextPage: number) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(filters)) {
            if (value) params.set(key, value);
        }
        if (nextPage > 1) params.set("page", String(nextPage));
        const query = params.toString();
        return query ? `${basePath}?${query}` : basePath;
    }
    return (
        <div className="mt-8 space-y-4">
            <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * PRODUCTS_PER_PAGE + 1}–{Math.min(page * PRODUCTS_PER_PAGE, totalDocs)} of {totalDocs} products
            </p>
            {totalPages > 1 && (
                <nav aria-label="Product pagination" className="flex flex-wrap items-center gap-4">
                    {page > 1 ? (
                        <Link href={pageHref(page - 1)} className="rounded-md border px-4 py-2 hover:bg-stone-100">Previous</Link>
                    ) : <span aria-disabled="true" className="px-4 py-2 text-muted-foreground">Previous</span>}
                    <span aria-current="page">Page {page} of {totalPages}</span>
                    {page < totalPages ? (
                        <Link href={pageHref(page + 1)} className="rounded-md border px-4 py-2 hover:bg-stone-100">Next</Link>
                    ) : <span aria-disabled="true" className="px-4 py-2 text-muted-foreground">Next</span>}
                </nav>
            )}
        </div>
    );
}
