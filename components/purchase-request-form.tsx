"use client";

import { useRef, useState, type SubmitEvent } from "react";
import type { Product } from "@/payload-types";

interface Props {
    productId: string;
    fulfillment: Product["fulfillment"];
}

export function PurchaseRequestForm({
    productId,
    fulfillment,
}: Props) {
    const submitting = useRef(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (submitting.current) return;

        const form = event.currentTarget;
        const fields = new FormData(form);

        submitting.current = true;
        setPending(true);
        setError("");

        try {
            const response = await fetch("/api/purchase-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    name: fields.get("name"),
                    email: fields.get("email"),
                    deliveryPreference: fields.get("deliveryPreference"),
                    message: fields.get("message"),
                    website: fields.get("website"),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Unable to send your request.");
                return;
            }

            form.reset();
            setSuccess(true);
        } catch {
            setError(
                "Unable to confirm submission. Check your connection before trying again.",
            );
        } finally {
            submitting.current = false;
            setPending(false);
        }
    }

    if (success) {
        return (
            <section className="mt-10 rounded-lg border p-6">
                <p role="status">
                    Your request was received. It is not a confirmed
                    reservation. An administrator will contact you by email.
                </p>
            </section>
        );
    }

    return (
        <section className="mt-10 rounded-lg border p-6">
            <h2 className="text-xl font-semibold">Request this item</h2>

            <p className="mt-2 text-sm text-muted-foreground">
                Sending a request does not reserve the item.
                Your contact details are visible only to administrators.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <fieldset disabled={pending} className="space-y-4">
                    <label className="block">
                        <span>Name</span>
                        <input
                            name="name"
                            autoComplete="name"
                            required
                            maxLength={100}
                            className="mt-1 block w-full rounded border p-2"
                        />
                    </label>

                    <label className="block">
                        <span>Email</span>
                        <input
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            maxLength={254}
                            className="mt-1 block w-full rounded border p-2"
                        />
                    </label>

                    <label className="block">
                        <span>Delivery preference</span>
                        <select
                            name="deliveryPreference"
                            defaultValue={
                                fulfillment === "shipping" ? "shipping" : "pickup"
                            }
                            required
                            className="mt-1 block w-full rounded border p-2"
                        >
                            {fulfillment !== "shipping" && (
                                <option value="pickup">Pickup</option>
                            )}
                            {fulfillment !== "pickup" && (
                                <option value="shipping">Shipping</option>
                            )}
                        </select>
                    </label>

                    <label className="block">
                        <span>Message (optional)</span>
                        <textarea
                            name="message"
                            rows={4}
                            maxLength={2000}
                            className="mt-1 block w-full rounded border p-2"
                        />
                    </label>

                    <div hidden>
                        <label>
                            Leave this field empty
                            <input
                                name="website"
                                tabIndex={-1}
                                autoComplete="off"
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="rounded bg-stone-900 px-4 py-2 text-white disabled:opacity-50"
                    >
                        {pending ? "Sending…" : "Send request"}
                    </button>
                </fieldset>

                {error && (
                    <p role="alert" className="text-red-700">
                        {error}
                    </p>
                )}
            </form>
        </section>
    );
}