import type { Payload, Where } from "payload";

export const PRODUCTS_PER_PAGE = 12;

export function parseProductPage(value: string | string[] | undefined) {
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw || !/^\d+$/.test(raw)) return 1;
    const page = Number(raw);
    return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export async function getProductPage(payload: Payload, where: Where, requestedPage: number) {
    // Count first so arbitrary URL page numbers never produce a huge database skip.
    const { totalDocs } = await payload.count({ collection: "products", where, overrideAccess: false });
    const totalPages = Math.max(1, Math.ceil(totalDocs / PRODUCTS_PER_PAGE));
    const page = Math.min(Math.max(1, requestedPage), totalPages);
    const result = await payload.find({
        collection: "products",
        where,
        depth: 1,
        sort: ["name", "id"],
        limit: PRODUCTS_PER_PAGE,
        page,
        draft: false,
        overrideAccess: false,
    });
    return { ...result, page };
}
