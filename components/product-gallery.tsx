"use client";

import Image from "next/image";
import { useState } from "react";

interface GalleryPhoto {
    id: string;
    src: string;
    alt: string;
    width: number;
    height: number;
}

export function ProductGallery({
    photos,
}: {
    photos: GalleryPhoto[];
}) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selected = photos[selectedIndex] ?? photos[0];

    if (!selected) {
        return (
            <p className="mt-6 rounded-lg bg-stone-100 p-8 text-center">
                No photos available.
            </p>
        );
    }

    return (
        <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_100px]">
            <div>
                <div className="flex aspect-square items-center justify-center rounded-lg bg-stone-100">
                    <Image
                        src={selected.src}
                        alt={selected.alt}
                        width={selected.width}
                        height={selected.height}
                        unoptimized
                        className="h-full w-full rounded-lg object-contain"
                    />
                </div>

                <p
                    aria-live="polite"
                    aria-atomic="true"
                    className="mt-2 text-sm text-muted-foreground"
                >
                    Photo {photos.indexOf(selected) + 1} of {photos.length}
                </p>
            </div>

            {photos.length > 1 && (
                <ul
                    aria-label="Choose a product photo"
                    className="flex gap-3 overflow-x-auto p-1 sm:max-h-[600px] sm:flex-col sm:overflow-y-auto"
                >
                    {photos.map((photo, index) => (
                        <li key={photo.id} className="shrink-0">
                            <button
                                type="button"
                                onClick={() => setSelectedIndex(index)}
                                aria-label={`Show photo ${index + 1}: ${photo.alt}`}
                                aria-pressed={photo === selected}
                                className={`block h-20 w-20 rounded-lg border-2 p-1
                                    focus-visible:outline-2
                                    focus-visible:outline-offset-2
                                    ${photo === selected
                                        ? "border-stone-900"
                                        : "border-transparent hover:border-stone-400"
                                    }`}
                            >
                                <Image
                                    src={photo.src}
                                    alt=""
                                    width={100}
                                    height={100}
                                    unoptimized
                                    className="h-full w-full rounded-md object-cover"
                                />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}