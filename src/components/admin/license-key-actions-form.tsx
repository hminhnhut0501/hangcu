"use client";

import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Props = {
  keyId: string;
  currentStatus: string;
  currentExpiresAt: string | null;
  currentRevokedReason: string | null;
  currentCustomerRef: string | null;
  currentExternalUserId: string | null;
  currentNotes: string | null;
};

export function LicenseKeyActionsForm({
  keyId,
  currentStatus,
  currentExpiresAt,
  currentRevokedReason,
  currentCustomerRef,
  currentExternalUserId,
  currentNotes
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function readErrorMessage(response: Response) {
    const json = await response.json().catch(() => null);
    return json?.error?.message ?? json?.message ?? `Request failed (${response.status})`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!window.confirm("Lưu thay đổi vòng đời license key?")) {
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const formData = new FormData(event.currentTarget);
      const csrfResponse = await fetch("/api/admin/csrf", { method: "GET", credentials: "include" });
      const csrfJson = (await csrfResponse.json()) as { data?: { token?: string } };
      const token = csrfJson.data?.token;
      if (!token) throw new Error("Missing CSRF token");

      const payload = {
        id: keyId,
        status: String(formData.get("status") ?? currentStatus),
        expiresAt: String(formData.get("expiresAt") ?? "").trim() || null,
        revokedReason: String(formData.get("revokedReason") ?? "").trim() || null,
        customerRef: String(formData.get("customerRef") ?? "").trim() || null,
        externalUserId: String(formData.get("externalUserId") ?? "").trim() || null,
        notes: String(formData.get("notes") ?? "").trim() || null
      };

      const response = await fetch("/api/admin/license-keys/status", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": token
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(await readErrorMessage(response));
      setStatus("done");
      setMessage("Đã cập nhật license key.");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Cập nhật thất bại.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          bgcolor: "background.paper",
          p: 3,
          boxShadow: "0 10px 35px rgba(15, 23, 42, 0.06)"
        }}
      >
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }
          }}
        >
          <TextField
            select
            name="status"
            label="Trạng thái"
            defaultValue={currentStatus}
            slotProps={{ select: { MenuProps: { disableScrollLock: true } } }}
          >
            <MenuItem value="available">available</MenuItem>
            <MenuItem value="reserved">reserved</MenuItem>
            <MenuItem value="issued">issued</MenuItem>
            <MenuItem value="redeemed">redeemed</MenuItem>
            <MenuItem value="expired">expired</MenuItem>
            <MenuItem value="revoked">revoked</MenuItem>
          </TextField>
          <TextField
            name="expiresAt"
            label="Hết hạn lúc"
            defaultValue={currentExpiresAt ?? ""}
            placeholder="2026-07-21T00:00:00.000Z"
          />
          <TextField
            name="customerRef"
            label="Tham chiếu khách"
            defaultValue={currentCustomerRef ?? ""}
          />
          <TextField
            name="externalUserId"
            label="ID user ngoài"
            defaultValue={currentExternalUserId ?? ""}
          />
          <TextField
            name="revokedReason"
            label="Lý do thu hồi"
            defaultValue={currentRevokedReason ?? ""}
            sx={{ gridColumn: { md: "1 / -1" } }}
          />
          <TextField
            name="notes"
            label="Ghi chú nội bộ"
            multiline
            minRows={4}
            defaultValue={currentNotes ?? ""}
            sx={{ gridColumn: { md: "1 / -1" } }}
          />
        </Box>
        <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Đang lưu..." : "Lưu thay đổi vòng đời"}
          </Button>
          <Typography variant="body2" color="text.secondary">
            {status === "done" ? message : status === "error" ? message || "Cập nhật thất bại." : null}
          </Typography>
        </Box>
      </Box>
    </form>
  );
}
