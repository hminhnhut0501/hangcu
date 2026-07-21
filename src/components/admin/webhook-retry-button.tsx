"use client";

import { useState } from "react";

type Props = {
  provider: string;
  providerEventId: string;
};

export function WebhookRetryButton({ provider, providerEventId }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onRetry() {
    setStatus("loading");
    try {
      const csrfResponse = await fetch("/api/admin/csrf", { method: "GET", credentials: "include" });
      const csrfJson = (await csrfResponse.json()) as { data?: { token?: string } };
      const token = csrfJson.data?.token;

      if (!token) {
        throw new Error("Missing CSRF token");
      }

      const response = await fetch("/api/admin/webhooks/retry", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": token
        },
        credentials: "include",
        body: JSON.stringify({ provider, providerEventId })
      });

      if (!response.ok) {
        throw new Error("Retry failed");
      }

      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <button
      type="button"
      onClick={onRetry}
      className="text-xs font-medium text-blue-600 disabled:opacity-50"
      disabled={status === "loading"}
    >
      {status === "loading" ? "Retrying..." : status === "done" ? "Retried" : "Retry"}
    </button>
  );
}
