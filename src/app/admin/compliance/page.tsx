import Link from "next/link";
import { ReadinessMatrix } from "@/components/admin/readiness-matrix";

const complianceItems = [
  {
    title: "Phủ chính sách",
    status: "ready" as const,
    description: "Tất cả trang chính sách quan trọng đã có mặt và có thể dẫn từ header/footer.",
    details: [
      "Privacy, Terms, Refund, License Agreement, FAQ, Contact, About, Pricing và Download đều phải thống nhất.",
      "Mỗi trang phụ nên dùng cùng layout header + footer để reviewer thấy đây là một storefront hoàn chỉnh.",
      "Không trộn lẫn câu chữ cũ kiểu donate khi đang bán license/support."
    ]
  },
  {
    title: "Mô tả hàng số",
    status: "ready" as const,
    description: "Storefront phải nói rõ đây là ứng dụng macOS native và giao hàng số ngay sau thanh toán.",
    details: [
      "Nêu rõ sản phẩm là software license, không phải hàng vật lý.",
      "Nhấn mạnh delivery bằng email hoặc automation sau khi thanh toán thành công.",
      "Giữ wording ngắn, tránh mô tả mơ hồ khiến reviewer hiểu lẫn mô hình kinh doanh."
    ]
  },
  {
    title: "Chính sách hoàn tiền",
    status: "ready" as const,
    description: "Refund chỉ mở cho lỗi thanh toán, giao không thành công hoặc cấp sai mã.",
    details: [
      "Không hứa hoàn tiền rộng cho license đã dùng xong.",
      "Ghi rõ phạm vi xử lý trong Refund Policy và License Agreement.",
      "Giữ cùng một wording trên website và hồ sơ submit cho provider."
    ]
  },
  {
    title: "Hỗ trợ khách hàng",
    status: "ready" as const,
    description: "Thông tin hỗ trợ xuất hiện ở footer, contact page và các trang pháp lý.",
    details: [
      "Email hỗ trợ phải nhìn thấy nhanh.",
      "Nếu có bot Telegram thì chỉ nên là kênh phụ trợ, không thay thế email.",
      "Luồng hỏi đáp, khiếu nại và đối soát cần thống nhất."
    ]
  },
  {
    title: "Song ngữ storefront",
    status: "ready" as const,
    description: "Mặc định tiếng Anh, có thể chuyển sang tiếng Việt và giữ được trật tự nội dung.",
    details: [
      "Giá, đơn vị tiền tệ và câu chữ phải đổi theo ngôn ngữ.",
      "Không dùng text dịch máy ở các phần chính của checkout và pricing.",
      "Header/footer nên dùng cùng menu trên mọi trang phụ."
    ]
  },
  {
    title: "Bộ hồ sơ nộp",
    status: "pending" as const,
    description: "Cần gom ảnh chụp, video mua thử và thông tin pháp lý trước khi nộp reviewer.",
    details: [
      "Ảnh homepage, checkout, pricing, license delivery, refund, terms và privacy.",
      "Video test purchase cho thấy đủ bước chọn gói, thanh toán và nhận license.",
      "Bằng chứng ownership, payout account và email hỗ trợ phải sẵn."
    ]
  }
];

const evidencePack = [
  "Ảnh homepage, checkout, pricing, download, legal pages",
  "Video test purchase từ chọn gói đến nhận license",
  "Thông tin email hỗ trợ và quy trình phản hồi",
  "Thông tin tài khoản nhận tiền và quyền sở hữu merchant",
  "Tóm tắt chính sách refund / delivery / license agreement"
];

const packetText = [
  "Store sells macOS software licenses for Hang Cú video with instant digital delivery.",
  "Support contact: hangcuvip@gmail.com and t.me/cuhotro_bot.",
  "Refund only for billing errors, duplicate charges, delivery failures, or wrong license assignment.",
  "Storefront is bilingual and links all legal pages in the header/footer."
].join("\n");

export default function AdminCompliancePage() {
  return (
    <ReadinessMatrix
      eyebrow="Compliance"
      title="Sẵn sàng merchant"
      description="Màn này gom các điểm reviewer thường hỏi trước khi duyệt merchant: mô tả hàng số, hỗ trợ, hoàn tiền và bằng chứng vận hành."
      summary={[
        { label: "Chính sách", value: "Đã phủ", tone: "emerald" },
        { label: "Storefront", value: "Song ngữ", tone: "blue" },
        { label: "Hoàn tiền", value: "Rõ ràng", tone: "amber" },
        { label: "Hồ sơ nộp", value: "Cần gom", tone: "rose" }
      ]}
      items={complianceItems}
      packetText={packetText}
      actions={[
        { label: "Mở legal hub", href: "/legal" },
        { label: "Mở checkout", href: "/checkout" },
        { label: "Xem pricing", href: "/products" },
        { label: "Site settings", href: "/admin/site-settings" },
        { label: "Download", href: "/download" }
      ]}
    />
  );
}
