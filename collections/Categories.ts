import type { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
    slug: "categories",
    admin: {
        useAsTitle: "name",
    },
    labels: {
        singular: "Category",
        plural: "Categories",
    },
    access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
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
            name: "parent",
            type: "relationship",
            relationTo: "categories",
            hasMany: false,
        },
        {
            name: "image",
            type: "relationship",
            relationTo: "media",
            admin: {
                description: "Optional image used for category navigation and collection pages.",
            },
        },
        {
            name: "subcategories",
            type: "join",
            collection: "categories",
            on: "parent",
            hasMany: true,
        }
    ],
}
