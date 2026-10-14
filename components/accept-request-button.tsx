"use client";

import { Button, useDocumentInfo, useFormModified } from "@payloadcms/ui";
import { useRef, useState } from "react";

export function AcceptRequestButton() {
    const { id, data } = useDocumentInfo();
    const modified = useFormModified();
    const submitting = useRef(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");

    if (!id || data?.status !== "new") {
        return null;
    }

    async function acceptRequest() {
        if (submitting.current || modified) return;

        submitting.current = true;
        setPending(true);
        setError("");

        try {
            const response = await fetch(
                `/api/purchase-requests/${encodeURIComponent(String(id))}/accept`,
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
                    || "Unable to accept this request.",
                );
                return;
            }

            window.location.reload();
        } catch {
            setError(
                "Unable to confirm acceptance. Reload to check the status before retrying.",
            );
        } finally {
            submitting.current = false;
            setPending(false);
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
                Accepting this request reserves the item for this buyer.
            </p>
            <Button
                type="button"
                size="medium"
                buttonStyle="primary"
                margin={false}
                onClick={acceptRequest}
                disabled={pending || modified}
            >
                {pending ? "Accepting…" : "Accept request"}
            </Button>

            {modified && (
                <p>Save your changes before accepting this request.</p>
            )}

            {error && <p role="alert">{error}</p>}
        </div>
    );
}
