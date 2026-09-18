import { CollectionConfig } from "payload";

export const Products: CollectionConfig = {
    slug: "products",
    admin: {
        useAsTitle: "name",
    },
    labels: {
        singular: "Product",
        plural: "Products",
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
            name: "image",
            type: "relationship",
            relationTo: "media",
            admin: {
                description: "Optional image used for product display.",
            },
        },
        {
            name: "inventory",
            type: "number",
            required: true,
            min: 0,
            defaultValue: 0,
        }
    ],
}
