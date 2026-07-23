"use client";

import { Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminDrawer } from "@/components/admin/admin-drawer";

type Props = {
  provider: string;
  providerEventId: string;
  triggerLabel?: string;
  drawerTitle?: string;
  drawerDescription?: string;
};

function WebhookRetryButtonInner({ provider, providerEventId }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function readErrorMessage(response: Response) {
    const json = await response.json().catch(() => null);
    return json?.error?.message ?? json?.message ?? `Request failed (${response.status})`;
  }

  async function onRetry() {
    if (!window.confirm(`Thử lại webhook ${providerEventId}?`)) {
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
      setMessage("Đã retry webhook.");
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
        variant="text"
        size="small"
        sx={{
          color: "#2563eb",
          px: 1,
          minWidth: 0,
          borderRadius: 999,
          textTransform: "none",
          transition: "transform 160ms ease, background-color 160ms ease",
          "&:hover": {
            backgroundColor: "#eff6ff",
            transform: "translateY(-1px)"
          }
        }}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Đang thử lại..." : status === "done" ? "Đã thử lại" : "Thử lại"}
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

export function WebhookRetryButton(props: Props) {
  if (!props.triggerLabel) {
    return <WebhookRetryButtonInner {...props} />;
  }

  return (
    <AdminDrawer
      trigger={
        <button type="button" className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
          {props.triggerLabel}
        </button>
      }
      title={props.drawerTitle ?? props.triggerLabel}
      description={props.drawerDescription}
    >
      <WebhookRetryButtonInner {...props} />
    </AdminDrawer>
  );
}
