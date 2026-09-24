import type { Metadata } from "next";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import type { Product } from "@/payload-types";
import { ProductGrid } from "@/components/product-grid";

export const metadata: Metadata = {
    title: "Shop All | My Little Shop",
};

export default async function ShopPage() {
    let products: Product[] = [];
    let unavailable = false;

    try {
        const payload = await getPayload({ config: configPromise });
        const result = await payload.find({
            collection: "products",
            depth: 1,
            sort: "name",
            pagination: false,
            overrideAccess: false,
        });
        products = result.docs;
    } catch (error) {
        console.error("Unable to load shop products:", error);
        unavailable = true;
    }

    return (
        <section className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 lg:px-8">
            <h1 className="text-3xl font-semibold tracking-tight">Shop All</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
                Browse all the little finds in our shop.
            </p>
            {products.length > 0 ? (
                <ProductGrid products={products} />
            ) : (
                <p className="mt-8 text-muted-foreground" role={unavailable ? "status" : undefined}>
                    {unavailable
                        ? "We couldn’t load the shop right now. Please try again shortly."
                        : "New finds are on their way. Check back soon."}
                </p>
            )}
        </section>
    );
}
