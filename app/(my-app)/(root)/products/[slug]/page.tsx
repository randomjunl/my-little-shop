
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { ProductGallery } from "@/components/product-gallery";
import { getProductPhotos } from "@/lib/product-photos";
import { PurchaseRequestForm } from "@/components/purchase-request-form";
interface ProductPageProps {
    params: Promise<{ slug: string }>;
}

export default async function ProductPage({
    params,
}: ProductPageProps) {
    const { slug } = await params;
    const payload = await getPayload({ config: configPromise });

    const result = await payload.find({
        collection: "products",
        where: {
            and: [
                { slug: { equals: slug } },
                { _status: { equals: "published" } },
            ],
        },
        depth: 1,
        limit: 1,
        draft: false,
        overrideAccess: false,
    });

    const product = result.docs[0];

    if (!product) {
        notFound();
    }

    const photos = getProductPhotos(product);

    const availabilityLabel =
        product.availability === "sold"
            ? "Sold"
            : product.availability === "reserved"
                ? "Reserved"
                : product.inventory > 0
                    ? "Available"
                    : "Out of stock";

    const fulfillmentLabels = {
        pickup: "Pickup only",
        shipping: "Shipping only",
        both: "Pickup or shipping",
    };

    const listingTypeLabels = {
        secondhand: "Secondhand",
        artwork: "Artwork",
        other: "Other",
    };

    const conditionLabels = {
        "like-new": "Like new",
        good: "Good",
        fair: "Fair",
        poor: "Poor",
    };

    const framingLabels = {
        framed: "Framed",
        unframed: "Unframed",
        "not-applicable": "Not applicable",
    };

    return (
        <section className="mx-auto max-w-5xl px-4 py-8">
            <Link
                href="/shop"
                className="underline underline-offset-4"
            >
                Back to shop
            </Link>

            <h1 className="mt-6 text-3xl font-semibold">
                {product.name}
            </h1>

            <div className="mt-6">
                <ProductGallery key={product.id} photos={photos} />
            </div>

            <p className="mt-4 text-xl font-medium">
                {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                }).format(product.price)}
            </p>

            <p className="mt-6 whitespace-pre-line">
                {product.description}
            </p>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                <div>
                    <dt className="font-semibold">Availability</dt>
                    <dd className="mt-1">{availabilityLabel}</dd>
                </div>

                <div>
                    <dt className="font-semibold">Delivery options</dt>
                    <dd className="mt-1">
                        {fulfillmentLabels[product.fulfillment]}
                    </dd>
                </div>

                <div>
                    <dt className="font-semibold">Listing type</dt>
                    <dd className="mt-1">
                        {listingTypeLabels[product.listingType]}
                    </dd>
                </div>
            </dl>
            {product.listingType === "secondhand" && (
                <section className="mt-8">
                    <h2 className="text-xl font-semibold">
                        Secondhand details
                    </h2>

                    <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                            <dt className="font-semibold">Condition</dt>
                            <dd className="mt-1">
                                {product.secondhandDetails?.condition
                                    ? conditionLabels[
                                    product.secondhandDetails.condition
                                    ]
                                    : "Not specified"}
                            </dd>
                        </div>

                        <div>
                            <dt className="font-semibold">Wear and defects</dt>
                            <dd className="mt-1 whitespace-pre-line">
                                {product.secondhandDetails?.wear?.trim()
                                    || "Not specified"}
                            </dd>
                        </div>
                    </dl>
                </section>
            )}

            {product.listingType === "artwork" && (
                <section className="mt-8">
                    <h2 className="text-xl font-semibold">
                        Artwork details
                    </h2>

                    <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                            <dt className="font-semibold">Medium</dt>
                            <dd className="mt-1">
                                {product.artworkDetails?.medium?.trim()
                                    || "Not specified"}
                            </dd>
                        </div>

                        <div>
                            <dt className="font-semibold">Dimensions</dt>
                            <dd className="mt-1">
                                {product.artworkDetails?.dimensions?.trim()
                                    || "Not specified"}
                            </dd>
                        </div>

                        <div>
                            <dt className="font-semibold">Framing</dt>
                            <dd className="mt-1">
                                {product.artworkDetails?.framing
                                    ? framingLabels[
                                    product.artworkDetails.framing
                                    ]
                                    : "Not specified"}
                            </dd>
                        </div>
                    </dl>
                </section>
            )}
            {product.availability === "available" && product.inventory > 0 && (
                <PurchaseRequestForm
                    key={product.id}
                    productId={product.id}
                    fulfillment={product.fulfillment}
                />
            )}

        </section>
    );
}