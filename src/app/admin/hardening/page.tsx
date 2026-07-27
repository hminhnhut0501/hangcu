import { ReadinessMatrix } from "@/components/admin/readiness-matrix";

const hardeningItems = [
  {
    title: "Xác thực admin",
    status: "ready" as const,
    description: "Mọi mutation route phải đi qua kiểm tra session và role trước khi xử lý.",
    details: [
      "Không cho phép thao tác nếu chưa có admin_session hợp lệ.",
      "Role tối thiểu phải được kiểm tra theo từng nhóm màn hình.",
      "Nếu session mất thì redirect về /admin/login ngay."
    ]
  },
  {
    title: "CSRF token",
    status: "ready" as const,
    description: "Form mutation gửi kèm token và server phải từ chối nếu token sai.",
    details: [
      "Lấy token từ server trước khi submit.",
      "Giữ token trong header x-csrf-token cho POST/PATCH/DELETE.",
      "Nếu token lỗi, UI phải báo rõ mã lỗi thay vì fail im lặng."
    ]
  },
  {
    title: "Kiểm tra origin",
    status: "ready" as const,
    description: "Chỉ chấp nhận origin đã khai báo cho production.",
    details: [
      "Đối chiếu NEXT_PUBLIC_APP_URL với domain đã deploy.",
      "Tránh để origin lệch giữa local, Vercel và VPS.",
      "Không mở origin rộng hơn mức cần thiết."
    ]
  },
  {
    title: "Audit log",
    status: "ready" as const,
    description: "Thay đổi của admin cần có audit trail để truy ngược thao tác.",
    details: [
      "Ghi ai thay đổi, thay đổi gì và lúc nào.",
      "Dùng audit log cho các màn giá, checkout, media và policy.",
      "Luồng export chỉ nên phục vụ support nội bộ."
    ]
  },
  {
    title: "Chặn theo role",
    status: "ready" as const,
    description: "Không để content manager, support manager và super-admin có cùng quyền.",
    details: [
      "Mỗi nhóm action cần role tối thiểu riêng.",
      "Ẩn form nếu role không đủ quyền, không chỉ disable nút.",
      "Tách quyền đọc, sửa và xoá rõ ràng hơn."
    ]
  },
  {
    title: "Fallback dữ liệu",
    status: "attention" as const,
    description: "Fallback im lặng chỉ nên là cơ chế tạm, vì nó có thể che lỗi DB thật.",
    details: [
      "Nếu Supabase thiếu bảng hay table cache lệch, UI phải báo rõ.",
      "Không để dữ liệu cũ tiếp tục hiển thị mà không có cảnh báo.",
      "Ưu tiên lộ lỗi sớm để tránh admin sửa xong nhưng runtime vẫn dùng data cũ."
    ]
  }
];

const checklist = [
  "Admin login bắt buộc trước khi vào /admin",
  "Mutation route có CSRF token và role check",
  "Audit log ghi nhận đổi giá, policy, media và orders",
  "Origin production khớp với biến môi trường",
  "Fallback DB không còn che lỗi âm thầm"
].join("\n");

export default function AdminHardeningPage() {
  return (
    <ReadinessMatrix
      eyebrow="Hardening"
      title="Bảo vệ luồng admin"
      description="Mục tiêu là giữ cho admin panel an toàn, dễ truy vết và không còn kiểu fail âm thầm khi dữ liệu thật chưa sẵn sàng."
      summary={[
        { label: "Auth", value: "Bắt buộc", tone: "emerald" },
        { label: "CSRF", value: "Có", tone: "blue" },
        { label: "Audit", value: "Có", tone: "violet" },
        { label: "Fallback", value: "Cảnh báo", tone: "amber" }
      ]}
      items={hardeningItems}
      packetText={checklist}
      actions={[
        { label: "Mở compliance", href: "/admin/compliance" },
        { label: "Mở audit log", href: "/admin/audit" },
        { label: "Mở site settings", href: "/admin/site-settings" },
        { label: "Mở orders", href: "/admin/orders" }
      ]}
    />
  );
}
