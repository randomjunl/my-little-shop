import configPromise from "@payload-config";
import { getPayload } from "payload";
import { notFound } from "next/navigation";
import type { Category } from "@/payload-types";
import { ProductGrid } from "@/components/product-grid";
import { ProductPagination } from "@/components/product-pagination";
import { getProductPage, parseProductPage } from "@/lib/product-pagination";

interface Props {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ page?: string | string[] }>;
}

export default async function CategoryPage({ params, searchParams }: Props) {
    const { id } = await params;
    const filters = await searchParams;
    if (!/^[a-f\d]{24}$/i.test(id)) notFound();

    let category: Category | undefined;
    let result: Awaited<ReturnType<typeof getProductPage>> | undefined;
    let unavailable = false;

    try {
        const payload = await getPayload({ config: configPromise });
        const categories = await payload.find({
            collection: "categories",
            where: { id: { equals: id } },
            limit: 1,
            depth: 0,
            overrideAccess: false,
        });
        category = categories.docs[0];
        if (category) {
            result = await getProductPage(
                payload,
                { category: { equals: id } },
                parseProductPage(filters.page),
            );
        }
    } catch (error) {
        console.error("Unable to load category products:", error);
        unavailable = true;
    }

    if (!category && !unavailable) notFound();

    return (
        <section className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 lg:px-8">
            <h1 className="text-3xl font-semibold tracking-tight">{category?.name ?? "Category"}</h1>
            {category?.description && (
                <p className="mt-4 max-w-2xl text-muted-foreground">{category.description}</p>
            )}
            {unavailable ? (
                <p className="mt-8 text-muted-foreground" role="status">
                    We couldn’t load this category right now. Please try again shortly.
                </p>
            ) : result && result.docs.length > 0 ? (
                <>
                    <ProductGrid products={result.docs} />
                    <ProductPagination basePath={`/category/${id}`} {...result} />
                </>
            ) : (
                <p className="mt-8 text-muted-foreground">No products in this category yet.</p>
            )}
        </section>
    );
}
