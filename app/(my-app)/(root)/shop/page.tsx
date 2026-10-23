import type { Metadata } from "next";
import configPromise from "@payload-config";
import { getPayload, type Where } from "payload";
import type { Category, Product } from "@/payload-types";
import { ProductGrid } from "@/components/product-grid";
import Link from "next/link";
import { ProductPagination } from "@/components/product-pagination";
import { getProductPage, parseProductPage } from "@/lib/product-pagination";

export const metadata: Metadata = {
    title: "Shop All | My Little Shop",
};

interface ShopPageProps {
    searchParams: Promise<{
        q?: string | string[];
        category?: string | string[];
        minPrice?: string | string[];
        maxPrice?: string | string[];
        availability?: string | string[];
        page?: string | string[];
    }>;
}

export default async function ShopPage({
    searchParams,
}: ShopPageProps) {
    const params = await searchParams;
    const value = (input: string | string[] | undefined) =>
        (Array.isArray(input) ? input[0] : input)?.trim() ?? "";
    const query = value(params.q).slice(0, 160);
    const category = value(params.category);
    const availability = value(params.availability);
    const minPrice = value(params.minPrice);
    const maxPrice = value(params.maxPrice);
    const requestedPage = parseProductPage(params.page);
    const validPrice = (price: string) => price === "" || (
        /^\d+(\.\d{1,2})?$/.test(price)
        && Number.isFinite(Number(price))
        && Number(price) <= Number.MAX_SAFE_INTEGER
    );
    let filterError = "";
    if (!validPrice(minPrice) || !validPrice(maxPrice)) {
        filterError = "Enter non-negative prices with up to two decimal places.";
    } else if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
        filterError = "Minimum price must not exceed maximum price.";
    } else if (category && !/^[a-f\d]{24}$/i.test(category)) {
        filterError = "Choose a valid category.";
    } else if (availability && !["available", "reserved", "sold"].includes(availability)) {
        filterError = "Choose a valid availability option.";
    }

    const conditions: Where[] = [];
    if (query) conditions.push({ or: [
        { name: { contains: query } },
        { description: { contains: query } },
    ] });
    if (category) conditions.push({ category: { equals: category } });
    if (minPrice) conditions.push({ price: { greater_than_equal: Number(minPrice) } });
    if (maxPrice) conditions.push({ price: { less_than_equal: Number(maxPrice) } });
    if (availability) conditions.push({ availability: { equals: availability } });
    if (availability === "available") conditions.push({ inventory: { greater_than: 0 } });
    const hasFilters = Boolean(query || category || minPrice || maxPrice || availability);
    let products: Product[] = [];
    let categories: Category[] = [];
    let unavailable = false;
    let pagination: { page: number; totalPages: number; totalDocs: number } | undefined;

    try {
        const payload = await getPayload({ config: configPromise });
        const categoryResult = await payload.find({
            collection: "categories",
            sort: "name",
            pagination: false,
            depth: 0,
            overrideAccess: false,
        });
        categories = categoryResult.docs;
        if (category && !categories.some((item) => item.id === category)) {
            filterError ||= "Choose a valid category.";
        }
        if (!filterError) {
            const result = await getProductPage(
                payload,
                conditions.length ? { and: conditions } : {},
                requestedPage,
            );
            products = result.docs;
            pagination = result;
        }
    } catch (error) {
        console.error("Unable to load shop products:", error);
        unavailable = true;
    }

    return (
        <section className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 lg:px-8">
            <h1 className="text-3xl font-semibold tracking-tight">Shop All</h1>
            <form
                action="/shop"
                method="get"
                key={JSON.stringify([query, category, minPrice, maxPrice, availability])}
                className="mt-6 grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
                <label className="block flex-1">
                    <span className="text-sm font-medium">Search products</span>
                    <input
                        key={query}
                        type="search"
                        id="product-search"
                        name="q"
                        defaultValue={query}
                        maxLength={160}
                        placeholder="Try notebook or ceramic"
                        className="mt-1 block w-full rounded-md border p-3"
                    />
                </label>

                <label className="block min-w-0">
                    <span className="text-sm font-medium">Category</span>
                    <select name="category" defaultValue={category}
                        className="mt-1 block w-full rounded-md border p-3">
                        <option value="">All categories</option>
                        {categories.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                </label>

                <label className="block min-w-0">
                    <span className="text-sm font-medium">Availability</span>
                    <select name="availability" defaultValue={availability}
                        className="mt-1 block w-full rounded-md border p-3">
                        <option value="">All availability</option>
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold">Sold</option>
                    </select>
                </label>

                <label className="block min-w-0">
                    <span className="text-sm font-medium">Minimum price (USD)</span>
                    <input type="number" name="minPrice" min="0" step="0.01"
                        defaultValue={minPrice}
                        className="mt-1 block w-full rounded-md border p-3" />
                </label>

                <label className="block min-w-0">
                    <span className="text-sm font-medium">Maximum price (USD)</span>
                    <input type="number" name="maxPrice" min="0" step="0.01"
                        defaultValue={maxPrice}
                        className="mt-1 block w-full rounded-md border p-3" />
                </label>

                <div className="flex flex-wrap items-center gap-3">
                <button
                    type="submit"
                    className="rounded-md bg-stone-900 px-5 py-3 text-white"
                >
                    Apply filters
                </button>

                {hasFilters && (
                    <Link href="/shop" className="px-2 py-3 underline">
                        Clear all
                    </Link>
                )}
                </div>
            </form>
            <p className="mt-4 max-w-2xl text-muted-foreground">
                Browse all the little finds in our shop.
            </p>
            {filterError ? (
                <p className="mt-8 text-red-700" role="alert">{filterError}</p>
            ) : products.length > 0 ? (
                <ProductGrid products={products} />
            ) : (
                <p className="mt-8 text-muted-foreground" role={unavailable ? "status" : undefined}>
                    {unavailable
                        ? "We couldn’t load the shop right now. Please try again shortly."
                        : hasFilters
                            ? "No products match your search and filters. Try changing them or clear all."
                            : "New finds are on their way. Check back soon."}
                </p>
            )}
            {!filterError && !unavailable && pagination && (
                <ProductPagination
                    basePath="/shop"
                    {...pagination}
                    filters={{ q: query, category, minPrice, maxPrice, availability }}
                />
            )}
        </section>
    );
}
