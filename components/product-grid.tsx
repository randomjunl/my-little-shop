import Image from "next/image";
import type { Product } from "@/payload-types";

export function ProductGrid({ products }: { products: Product[] }) {
    return (
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
    );
}
