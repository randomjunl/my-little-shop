import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/payload-types";
import { getProductCover } from "@/lib/product-photos";

export function ProductGrid({ products }: { products: Product[] }) {
    return (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
                const cover = getProductCover(product);
                return (
                <li key={product.id}>
                    <article className="h-full rounded-lg border p-5">
                        <h2 className="text-lg font-semibold">
                            <Link
                                href={`/products/${encodeURIComponent(product.slug)}`}
                                className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
                            >
                                {product.name}
                            </Link>
                        </h2>
                        <div>
                            {cover ? (
                                <Image
                                    src={cover.image.url!}
                                    alt={cover.alt}
                                    width={cover.image.width || 800}
                                    height={cover.image.height || 800}
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
                            {product.availability === "sold"
                                ? "Sold"
                                : product.availability === "reserved"
                                    ? "Reserved"
                                    : product.inventory > 0
                                        ? "Available"
                                        : "Out of stock"}
                        </p>
                    </article>
                </li>
                );
            })}
        </ul>
    );
}
