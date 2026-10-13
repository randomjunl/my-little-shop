import configPromise from "@payload-config";
import { getPayload } from "payload";
import { z } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({
    productId: z.string().regex(/^[a-f\d]{24}$/i),
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(254)
        .transform((value) => value.toLowerCase()),
    deliveryPreference: z.enum(["pickup", "shipping"]),
    message: z.string().trim().max(2000).optional(),
    website: z.string().max(200).optional(),
});

export async function POST(request: Request) {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return Response.json(
            { error: "Send a valid JSON request." },
            { status: 400 },
        );
    }

    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
        return Response.json(
            { error: "Check your name, email, and delivery preference." },
            { status: 400 },
        );
    }

    const input = parsed.data;

    if (input.website?.trim()) {
        return Response.json(
            { error: "Unable to accept this request." },
            { status: 400 },
        );
    }

    try {
        const payload = await getPayload({
            config: configPromise,
        });

        const result = await payload.find({
            collection: "products",
            where: {
                and: [
                    { id: { equals: input.productId } },
                    { _status: { equals: "published" } },
                ],
            },
            limit: 1,
            depth: 0,
            draft: false,
            overrideAccess: false,
        });

        const product = result.docs[0];

        if (!product) {
            return Response.json(
                { error: "This listing is no longer available." },
                { status: 404 },
            );
        }

        if (
            product.availability !== "available"
            || product.inventory <= 0
        ) {
            return Response.json(
                { error: "This item is not accepting requests." },
                { status: 409 },
            );
        }

        const deliveryAllowed =
            product.fulfillment === "both"
            || product.fulfillment === input.deliveryPreference;

        if (!deliveryAllowed) {
            return Response.json(
                { error: "Choose a delivery option offered by this listing." },
                { status: 400 },
            );
        }

        await payload.create({
            collection: "purchase-requests",
            overrideAccess: true,
            data: {
                status: "new",
                product: product.id,
                name: input.name,
                email: input.email,
                deliveryPreference: input.deliveryPreference,
                message: input.message,
            },
        });

        return Response.json(
            {
                message:
                    "Your request was received. It is not a confirmed reservation.",
            },
            { status: 201 },
        );
    } catch {
        console.error("Purchase request submission failed.");

        return Response.json(
            { error: "Unable to send your request. Please try again later." },
            { status: 500 },
        );
    }
}
