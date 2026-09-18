import configPromise from "@payload-config"
import { getPayload } from "payload"
import { notFound } from "next/navigation"
import Image from "next/image"

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
                <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <li key={product.id}>
                            <article className="h-full rounded-lg border p-5">
                                <h2 className="text-lg font-semibold">
                                    {product.name}
                                </h2>
                                <div>
                                    {product.image && typeof product.image === "object" && product.image.url ? (
                                        <Image
                                            src={product.image.url}
                                            alt={product.image.alt || product.name}
                                            width={product.image.width || 800}
                                            height={product.image.height || 800}
                                            unoptimized
                                            className="mt-4 aspect-square w-full rounded-md bg-stone-100 object-contain"
                                        />
                                    ) : (
                                        <div className="mt-4 flex aspect-square w-full items-center justify-center rounded-md bg-stone-100 text-sm text-muted-foreground">No image available</div>
                                    )}
                                </div>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    {product.description}
                                </p>

                                <p className="mt-4 font-medium">
                                    {new Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                    }).format(product.price)}
                                </p>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    {product.inventory > 0 ? "In stock" : "Out of stock"}
                                </p>
                            </article>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-8 text-muted-foreground">
                    No products in this category yet.
                </p>
            )}
        </section>
    );
}
