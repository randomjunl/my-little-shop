import type { CollectionConfig } from "payload";
import { isAdministrator } from "@/lib/access";
import { acceptPurchaseRequest } from "@/lib/accept-purchase-request";
import { cancelPurchaseRequest } from "@/lib/cancel-purchase-request";
import { completePurchaseRequest, declinePurchaseRequest } from "@/lib/finish-purchase-request";

export const PurchaseRequests: CollectionConfig = {
    slug: "purchase-requests",
    labels: {
        singular: "Purchase request",
        plural: "Purchase requests",
    },
    admin: {
        useAsTitle: "name",
        defaultColumns: [
            "name",
            "product",
            "status",
            "deliveryPreference",
            "createdAt",
        ],
    },
    access: {
        create: isAdministrator,
        read: isAdministrator,
        update: isAdministrator,
        delete: isAdministrator,
    },
    fields: [
        {
            name: "product",
            type: "relationship",
            relationTo: "products",
            required: true,
        },
        {
            name: "name",
            type: "text",
            required: true,
            maxLength: 100,
            validate: (value: string | null | undefined) =>
                Boolean(value?.trim()) || "Enter your name.",
        },
        {
            name: "email",
            type: "email",
            required: true,
        },
        {
            name: "deliveryPreference",
            type: "select",
            required: true,
            options: [
                { label: "Pickup", value: "pickup" },
                { label: "Shipping", value: "shipping" },
            ],
        },
        {
            name: "message",
            type: "textarea",
            maxLength: 2000,
        },
        {
            name: "status",
            type: "select",
            required: true,
            defaultValue: "new",
            options: [
                { label: "New", value: "new" },
                { label: "Accepted", value: "accepted" },
                { label: "Completed", value: "completed" },
                { label: "Declined", value: "declined" },
                { label: "Cancelled", value: "cancelled" },
            ],
            admin: {
                readOnly: true,
                description: "Request actions will control this status.",
            },
            access: {
                create: () => false,
                update: () => false,
            },
        },
        {
            name: "requestActions",
            type: "ui",
            admin: {
                components: {
                    Field: "/components/accept-request-button#AcceptRequestButton",
                },
            },
        },
    ],
    endpoints: [acceptPurchaseRequest, cancelPurchaseRequest, completePurchaseRequest, declinePurchaseRequest],
};
