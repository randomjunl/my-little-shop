import { APIError, type Endpoint } from "payload";

function finishRequest(action: "complete" | "decline"): Endpoint {
    return {
        path: `/:id/${action}`,
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
                throw new APIError("Reservation transactions are unavailable.", 503);
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

                const requiredStatus = action === "complete" ? "accepted" : "new";
                if (purchaseRequest.status !== requiredStatus) {
                    throw new APIError(
                        action === "complete"
                            ? "Only accepted requests can be completed."
                            : "Only new requests can be declined.",
                        409,
                    );
                }

                if (action === "complete") {
                    const productId = typeof purchaseRequest.product === "string"
                        ? purchaseRequest.product
                        : purchaseRequest.product.id;
                    const products = await payload.find({
                        collection: "products",
                        where: { id: { equals: productId } },
                        limit: 1,
                        depth: 0,
                        draft: false,
                        overrideAccess: false,
                        req,
                    });
                    const product = products.docs[0];
                    const reservationId = typeof product?.reservationRequest === "string"
                        ? product.reservationRequest
                        : product?.reservationRequest?.id;

                    if (!product || product.availability !== "reserved"
                        || reservationId !== purchaseRequest.id || product.inventory <= 0) {
                        throw new APIError("This request no longer holds a valid reservation.", 409);
                    }

                    await payload.update({
                        collection: "products",
                        depth: 0,
                        id: product.id,
                        data: {
                            availability: "sold",
                            inventory: 0,
                            reservationRequest: null,
                            _status: product._status,
                        },
                        draft: false,
                        overrideAccess: true,
                        req,
                    });
                }

                await payload.update({
                    collection: "purchase-requests",
                    depth: 0,
                    id: purchaseRequest.id,
                    data: { status: action === "complete" ? "completed" : "declined" },
                    overrideAccess: true,
                    req,
                });
                await payload.db.commitTransaction(transactionID);
                return Response.json({
                    message: action === "complete" ? "Sale completed and item marked sold." : "Request declined.",
                });
            } catch (error) {
                await payload.db.rollbackTransaction(transactionID);
                throw error;
            } finally {
                delete req.transactionID;
            }
        },
    };
}

export const completePurchaseRequest = finishRequest("complete");
export const declinePurchaseRequest = finishRequest("decline");
