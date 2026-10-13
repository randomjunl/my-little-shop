import { isAdministrator } from "@/lib/access";
import { ValidationError, type CollectionConfig } from "payload";

export const Products: CollectionConfig = {
    slug: "products",
    admin: {
        useAsTitle: "name",
    },
    labels: {
        singular: "Product",
        plural: "Products",
    },
    versions: {
        drafts: true,
    },
    access: {
        read: ({ req }) => {
            if (req.user?.role === "admin") return true;

            return {
                _status: { equals: "published" },
            };
        },
        readVersions: isAdministrator,
        create: isAdministrator,
        update: isAdministrator,
        delete: isAdministrator,
    },
    hooks: {
        beforeValidate: [
            ({ data, originalDoc }) => {
                if (!data) return data;

                const availability =
                    data.availability ?? originalDoc?.availability ?? "available";
                const inventory =
                    data.inventory ?? originalDoc?.inventory ?? 1;

                if (availability === "sold") {
                    data.inventory = 0;
                } else if (
                    (availability === "available" ||
                        availability === "reserved") &&
                    inventory === 0
                ) {
                    throw new ValidationError({
                        errors: [
                            {
                                path: "inventory",
                                message:
                                    "Available or reserved listings need a quantity greater than zero.",
                            },
                        ],
                    });
                }

                return data;
            },
        ],
    },
    fields: [
        {
            name: "name",
            type: "text",
            required: true,
        },
        {
            name: "slug",
            type: "text",
            required: true,
            unique: true,
        },
        {
            name: "description",
            type: "textarea",
            required: true,
        },
        {
            name: "listingType",
            type: "select",
            required: true,
            defaultValue: "other",
            options: [
                { label: "Secondhand", value: "secondhand" },
                { label: "Artwork", value: "artwork" },
                { label: "Other", value: "other" },
            ],
        },
        {
            name: "secondhandDetails",
            type: "group",
            label: "Secondhand details",
            admin: {
                condition: (data) => data.listingType === "secondhand",
            },
            fields: [
                {
                    name: "condition",
                    type: "select",
                    options: [
                        { label: "Like new", value: "like-new" },
                        { label: "Good", value: "good" },
                        { label: "Fair", value: "fair" },
                        { label: "Poor", value: "poor" },
                    ],
                },
                {
                    name: "wear",
                    type: "textarea",
                    label: "Wear and defects",
                    admin: {
                        description:
                            "Describe scratches, stains, damage, or missing parts. Write 'None known' if applicable.",
                    },
                },
            ],
        },
        {
            name: "artworkDetails",
            type: "group",
            label: "Artwork details",
            admin: {
                condition: (data) => data.listingType === "artwork",
            },
            fields: [
                {
                    name: "medium",
                    type: "text",
                    admin: {
                        description: "For example: watercolor on paper or acrylic on canvas.",
                    },
                },
                {
                    name: "dimensions",
                    type: "text",
                    admin: {
                        description: "Include units, for example: 12 × 16 inches, unframed.",
                    },
                },
                {
                    name: "framing",
                    type: "select",
                    options: [
                        { label: "Framed", value: "framed" },
                        { label: "Unframed", value: "unframed" },
                        { label: "Not applicable", value: "not-applicable" },
                    ],
                },
            ],
        },
        {
            name: "fulfillment",
            type: "select",
            label: "Pickup and shipping",
            required: true,
            defaultValue: "pickup",
            options: [
                { label: "Pickup only", value: "pickup" },
                { label: "Shipping only", value: "shipping" },
                { label: "Pickup or shipping", value: "both" },
            ],
            admin: {
                description: "Choose how the buyer can receive this item. Arrange private pickup addresses separately.",
            },
        },
        {
            name: "availability",
            type: "select",
            required: true,
            defaultValue: "available",
            options: [
                { label: "Available", value: "available" },
                { label: "Reserved", value: "reserved" },
                { label: "Sold", value: "sold" },
            ],
        },
        {
            name: "reservationRequest",
            type: "relationship",
            relationTo: "purchase-requests",
            label: "Reserved for request",
            access: {
                read: ({ req }) => req.user?.role === "admin",
                create: () => false,
                update: () => false,
            },
            admin: {
                readOnly: true,
                description:
                    "Managed automatically when a purchase request is accepted or cancelled.",
            },
        },
        {
            name: "price",
            type: "number",
            required: true,
            min: 0,
        },
        {
            name: "category",
            type: "relationship",
            relationTo: "categories",
            required: true,
        },
        {
            name: "photos",
            type: "array",
            labels: { singular: "Photo", plural: "Photos" },
            admin: {
                description: "Add and drag photos to reorder them. The first photo is the cover image.",
            },
            fields: [
                {
                    name: "image",
                    type: "upload",
                    relationTo: "media",
                    required: true,
                },
                {
                    name: "alt",
                    type: "text",
                    label: "Alternative text",
                    required: true,
                    validate: (value: string | null | undefined) =>
                        Boolean(value?.trim()) || "Describe what this photo shows.",
                },
            ],
        },
        {
            name: "image",
            type: "relationship",
            relationTo: "media",
            label: "Legacy image",
            admin: {
                description: "Existing single-image cover, used when Photos is empty. Add Photos above to replace it.",
            },
        },
        {
            name: "inventory",
            type: "number",
            required: true,
            min: 0,
            defaultValue: 1,
        }
    ],
}
