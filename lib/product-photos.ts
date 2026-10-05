import type { Media, Product } from "@/payload-types";

export function getProductCover(product: Product): { image: Media; alt: string } | undefined {
    const firstPhoto = product.photos?.[0];
    const image = firstPhoto ? firstPhoto.image : product.image;

    if (!image || typeof image !== "object" || !image.url) return undefined;

    return {
        image,
        alt: firstPhoto?.alt || image.alt || product.name,
    };
}

export function getProductPhotos(product: Product) {
    const photos = (product.photos ?? []).flatMap((photo) => {
        const image = photo.image;

        if (!image || typeof image !== "object" || !image.url) {
            return [];
        }

        return [{
            id: photo.id || image.id,
            src: image.url,
            alt: photo.alt || image.alt || product.name,
            width: image.width || 800,
            height: image.height || 800,
        }];
    });

    if (product.photos?.length) {
        return photos;
    }

    const cover = getProductCover(product);

    return cover ? [{
        id: cover.image.id,
        src: cover.image.url!,
        alt: cover.alt,
        width: cover.image.width || 800,
        height: cover.image.height || 800,
    }] : [];
}
