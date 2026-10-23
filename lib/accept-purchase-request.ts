import { APIError, type Endpoint } from "payload";

export const acceptPurchaseRequest: Endpoint = {
    path: "/:id/accept",
    method: "post",

    handler: async (req) => {
        if (req.user?.role !== "admin") {
            throw new APIError("Administrator access required.", 403);
        }

        const id = req.routeParams?.id;

        if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
            throw new APIError("Invalid request ID.", 400);
        }

        const payload = req.payload;
        const transactionID = await payload.db.beginTransaction();

        if (transactionID == null) {
            throw new APIError(
                "Reservation transactions are unavailable.",
                503,
            );
        }

        req.transactionID = transactionID;

        try {
            const requests = await payload.find({
                collection: "purchase-requests",
                where: { id: { equals: id } },
                limit: 1,
                depth: 0,
                overrideAccess: false,
                req,
            });

            const purchaseRequest = requests.docs[0];

            if (!purchaseRequest) {
                throw new APIError("Request not found.", 404);
            }

            if (purchaseRequest.status !== "new") {
                throw new APIError(
                    "Only new requests can be accepted.",
                    409,
                );
            }

            const productId =
                typeof purchaseRequest.product === "string"
                    ? purchaseRequest.product
                    : purchaseRequest.product.id;

            const products = await payload.find({
                collection: "products",
                where: {
                    and: [
                        { id: { equals: productId } },
                        { _status: { equals: "published" } },
                    ],
                },
                limit: 1,
                depth: 0,
                draft: false,
                overrideAccess: false,
                req,
            });

            const product = products.docs[0];

            if (
                !product
                || product.availability !== "available"
                || product.inventory <= 0
                || product.reservationRequest
            ) {
                throw new APIError(
                    "This item is no longer available to reserve.",
                    409,
                );
            }

            if (
                product.fulfillment !== "both"
                && product.fulfillment !== purchaseRequest.deliveryPreference
            ) {
                throw new APIError(
                    "The requested delivery option is no longer offered.",
                    409,
                );
            }

            await payload.update({
                collection: "products",
                depth: 0,
                id: product.id,
                data: {
                    availability: "reserved",
                    reservationRequest: purchaseRequest.id,
                },
                draft: false,
                overrideAccess: true,
                req,
            });

            await payload.update({
                collection: "purchase-requests",
                depth: 0,
                id: purchaseRequest.id,
                data: { status: "accepted" },
                overrideAccess: true,
                req,
            });

            await payload.db.commitTransaction(transactionID);

            return Response.json({
                message: "Request accepted and item reserved.",
            });
        } catch (error) {
            await payload.db.rollbackTransaction(transactionID);
            if (error && typeof error === "object" && "code" in error && error.code === 112) {
                throw new APIError(
                    "The item changed during acceptance. Reload the request and check its availability.",
                    409,
                );
            }
            throw error;
        } finally {
            delete req.transactionID;
        }
    },
};
