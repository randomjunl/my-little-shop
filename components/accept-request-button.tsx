"use client";

import { Button, useDocumentInfo, useFormModified } from "@payloadcms/ui";
import { useRef, useState } from "react";

type RequestAction = "accept" | "cancel" | "complete" | "decline";

export function AcceptRequestButton() {
    const { id, data } = useDocumentInfo();
    const modified = useFormModified();
    const submitting = useRef(false);
    const [pending, setPending] = useState<RequestAction | null>(null);
    const [error, setError] = useState("");

    if (!id || (data?.status !== "new" && data?.status !== "accepted")) {
        return null;
    }

    async function updateRequest(action: RequestAction) {
        if (submitting.current || modified) return;

        submitting.current = true;
        setPending(action);
        setError("");

        try {
            const response = await fetch(
                `/api/purchase-requests/${encodeURIComponent(String(id))}/${action}`,
                {
                    method: "POST",
                    credentials: "same-origin",
                },
            );

            const result = await response.json();

            if (!response.ok) {
                setError(
                    result.errors?.[0]?.message
                    || result.error
                    || "Unable to update this request.",
                );
                return;
            }

            window.location.reload();
        } catch {
            setError(
                "Unable to confirm the update. Reload to check the status before retrying.",
            );
        } finally {
            submitting.current = false;
            setPending(null);
        }
    }

    return (
        <div
            style={{
                marginTop: "1rem",
                marginBottom: "1rem",
                padding: "1rem",
                border: "1px solid var(--theme-elevation-200)",
                borderRadius: "6px",
                background: "var(--theme-elevation-50)",
            }}
        >
            <p style={{ marginTop: 0, marginBottom: "0.75rem" }}>
                {data.status === "new"
                    ? "Accepting this request reserves the item for this buyer."
                    : "Complete the sale after payment and handoff. Cancelling releases the reservation."}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {data.status === "new" && <Button
                type="button"
                size="medium"
                buttonStyle="primary"
                margin={false}
                onClick={() => updateRequest("accept")}
                disabled={pending !== null || modified}
            >
                {pending === "accept" ? "Accepting…" : "Accept request"}
            </Button>}
            {data.status === "new" && <Button
                type="button"
                size="medium"
                buttonStyle="secondary"
                margin={false}
                onClick={() => updateRequest("decline")}
                disabled={pending !== null || modified}
            >
                {pending === "decline" ? "Declining…" : "Decline request"}
            </Button>}
            {data.status === "accepted" && <Button
                type="button"
                size="medium"
                buttonStyle="primary"
                margin={false}
                onClick={() => updateRequest("complete")}
                disabled={pending !== null || modified}
            >
                {pending === "complete" ? "Completing…" : "Complete sale"}
            </Button>}
            <Button
                type="button"
                size="medium"
                buttonStyle="secondary"
                margin={false}
                onClick={() => updateRequest("cancel")}
                disabled={pending !== null || modified}
            >
                {pending === "cancel" ? "Cancelling…" : "Cancel request"}
            </Button>
            </div>

            {modified && (
                <p>Save your changes before updating this request.</p>
            )}

            {error && <p role="alert">{error}</p>}
        </div>
    );
}
