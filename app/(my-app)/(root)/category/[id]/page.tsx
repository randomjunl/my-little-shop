import configPromise from "@payload-config"
import { getPayload } from "payload"
import { notFound } from "next/navigation"
import { ProductGrid } from "@/components/product-grid"

interface Props {
    params: Promise<{ id: string }>;
}

// Fetch category data from Payload CMS by ID
async function getCategory(id: string) {
    try {
        const payload = await getPayload({ config: configPromise });
        return await payload.findByID({
            collection: "categories",
            id,
            depth: 1,
        });
    } catch {
        notFound();
    }
}

async function getProducts(categoryId: string) {
    try {
        const payload = await getPayload({ config: configPromise });
        const result = await payload.find({
            collection: "products",
            where: {
                category: {
                    equals: categoryId,
                },
            },
            depth: 1,
            sort: "name",
            limit: 12,
            overrideAccess: false,
        });
        return result.docs;
    } catch {
        notFound();
    }
}

export default async function CategoryPage({ params }: Props) {
    const { id } = await params;
    const category = await getCategory(id);
    const products = await getProducts(id);


    return (
        <section className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 lg:px-8">
            <h1 className="text-3xl font-semibold tracking-tight">{category.name}</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">{category.description}</p>
            {products.length > 0 ? (
                <ProductGrid products={products} />
            ) : (
                <p className="mt-8 text-muted-foreground">
                    No products in this category yet.
                </p>
            )}
        </section>
    );
}
