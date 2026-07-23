"use client";

import { Alert, Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AdminDrawer } from "@/components/admin/admin-drawer";

type Props = {
  orderNumber: string;
  currentStatus: string;
  currentPaymentStatus: string;
  currentFulfillmentStatus: string;
  currentNotes: string | null;
  triggerLabel?: string;
  drawerTitle?: string;
  drawerDescription?: string;
};

function OrderStatusFormInner({
  orderNumber,
  currentStatus,
  currentPaymentStatus,
  currentFulfillmentStatus,
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
    if (!window.confirm("Áp dụng các thay đổi cho đơn này?")) {
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
        orderNumber,
        status: String(formData.get("status") ?? ""),
        paymentStatus: String(formData.get("paymentStatus") ?? ""),
        fulfillmentStatus: String(formData.get("fulfillmentStatus") ?? ""),
        notes: String(formData.get("notes") ?? "")
      };

      const response = await fetch("/api/admin/orders", {
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
      setMessage("Đã cập nhật đơn.");
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
            label="Trạng thái đơn"
            defaultValue={currentStatus}
            slotProps={{ select: { MenuProps: { disableScrollLock: true } } }}
          >
            <MenuItem value="pending">pending</MenuItem>
            <MenuItem value="paid">paid</MenuItem>
            <MenuItem value="processing">processing</MenuItem>
            <MenuItem value="fulfilled">fulfilled</MenuItem>
            <MenuItem value="failed">failed</MenuItem>
            <MenuItem value="cancelled">cancelled</MenuItem>
          </TextField>
          <TextField
            select
            name="paymentStatus"
            label="Trạng thái thanh toán"
            defaultValue={currentPaymentStatus}
            slotProps={{ select: { MenuProps: { disableScrollLock: true } } }}
          >
            <MenuItem value="unpaid">unpaid</MenuItem>
            <MenuItem value="pending">pending</MenuItem>
            <MenuItem value="paid">paid</MenuItem>
            <MenuItem value="failed">failed</MenuItem>
            <MenuItem value="refunded">refunded</MenuItem>
            <MenuItem value="partially_refunded">partially_refunded</MenuItem>
          </TextField>
          <TextField
            select
            name="fulfillmentStatus"
            label="Trạng thái fulfillment"
            defaultValue={currentFulfillmentStatus}
            slotProps={{ select: { MenuProps: { disableScrollLock: true } } }}
          >
            <MenuItem value="unfulfilled">unfulfilled</MenuItem>
            <MenuItem value="processing">processing</MenuItem>
            <MenuItem value="partially_fulfilled">partially_fulfilled</MenuItem>
            <MenuItem value="fulfilled">fulfilled</MenuItem>
            <MenuItem value="failed">failed</MenuItem>
          </TextField>
          <TextField
            name="notes"
            label="Ghi chú nội bộ"
            multiline
            minRows={4}
            defaultValue={currentNotes ?? ""}
            placeholder="Thêm ghi chú chỉ admin xem..."
            sx={{ gridColumn: { md: "1 / -1" } }}
          />
        </Box>
        <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
          <Typography variant="body2" color="text.secondary">
            {status === "done" ? message : status === "error" ? message || "Cập nhật thất bại." : null}
          </Typography>
        </Box>
      </Box>
    </form>
  );
}

export function OrderStatusForm(props: Props) {
  if (!props.triggerLabel) {
    return <OrderStatusFormInner {...props} />;
  }

  return (
    <AdminDrawer
      trigger={
        <button type="button" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-sm">
          {props.triggerLabel}
        </button>
      }
      title={props.drawerTitle ?? props.triggerLabel}
      description={props.drawerDescription}
    >
      <OrderStatusFormInner {...props} />
    </AdminDrawer>
  );
}
