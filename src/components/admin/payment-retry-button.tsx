"use client";

import { Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  provider: string;
  providerEventId: string;
};

export function PaymentRetryButton({ provider, providerEventId }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function readErrorMessage(response: Response) {
    const json = await response.json().catch(() => null);
    return json?.error?.message ?? json?.message ?? `Request failed (${response.status})`;
  }

  async function onRetry() {
    if (!window.confirm(`Thử lại payment event ${providerEventId}?`)) {
      return;
    }
    setStatus("loading");
    setMessage("");
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
        throw new Error(await readErrorMessage(response));
      }

      setStatus("done");
      setMessage("Đã retry payment event.");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Retry thất bại.");
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        onClick={onRetry}
        variant="outlined"
        size="small"
        sx={{ borderColor: "#bfdbfe", color: "#1d4ed8", bgcolor: "#fff" }}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Đang thử lại..." : status === "done" ? "Đã thử lại" : "Thử lại event"}
      </Button>
      {status === "error" ? (
        <Typography variant="caption" color="error">
          {message || "Retry thất bại."}
        </Typography>
      ) : null}
      {status === "done" ? (
        <Typography variant="caption" color="success.main">
          {message}
        </Typography>
      ) : null}
    </div>
  );
}
