import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { StaticPage } from "@/components/storefront/static-page";

export default async function PrivacyPage() {
  const locale = await getStorefrontLocale();
  const vi = locale === "vi";

  return (
    <StaticPage
      eyebrow={vi ? "Chính sách bảo mật" : "Privacy Policy"}
      title={
        vi
          ? "Chúng tôi chỉ thu thập dữ liệu cần thiết để xử lý đơn hàng và giao license."
          : "We only collect the data needed to process orders and deliver licenses."
      }
      intro={
        vi
          ? "Trang này giải thích dữ liệu nào được thu thập, vì sao chúng tôi cần dữ liệu đó và cách chúng tôi bảo vệ dữ liệu của bạn."
          : "This page explains what data we collect, why we need it, and how we protect it."
      }
      sections={[
        {
          title: vi ? "1. Thông tin chúng tôi thu thập" : "1. Information we collect",
          list: vi
            ? [
                "Email, tên hiển thị, thông tin đơn hàng, trạng thái thanh toán và lịch sử giao dịch.",
                "Nội dung trao đổi hỗ trợ nếu bạn chủ động liên hệ qua email hoặc biểu mẫu liên hệ.",
                "Dữ liệu kỹ thuật tối thiểu như IP, thiết bị, trình duyệt, log lỗi và sự kiện bảo mật."
              ]
            : [
                "Email address, display name, order details, payment status, and transaction history.",
                "Support messages when you contact us by email or through the contact form.",
                "Minimal technical data such as IP, device, browser, error logs, and security events."
              ]
        },
        {
          title: vi ? "2. Mục đích sử dụng" : "2. How we use it",
          list: vi
            ? [
                "Xử lý thanh toán và gửi license/key qua email.",
                "Kích hoạt, xác minh, khôi phục hoặc thu hồi license khi cần.",
                "Hỗ trợ cài đặt, xử lý lỗi, hoàn tiền, chống gian lận và chargeback.",
                "Cải thiện trải nghiệm sản phẩm và tuân thủ nghĩa vụ kế toán, thuế, pháp lý."
              ]
            : [
                "Process payments and send license keys by email.",
                "Activate, verify, restore, or revoke licenses when needed.",
                "Provide installation help, troubleshoot issues, handle refunds, and prevent fraud or chargebacks.",
                "Improve the product and meet accounting, tax, and legal obligations."
              ]
        },
        {
          title: vi ? "3. Chia sẻ dữ liệu" : "3. Data sharing",
          body: vi
            ? "Chúng tôi chỉ chia sẻ dữ liệu với các bên cần thiết để vận hành dịch vụ, ví dụ nền tảng thanh toán, email delivery, hạ tầng lưu trữ, công cụ chống gian lận và dịch vụ hỗ trợ. Chúng tôi không bán dữ liệu cá nhân."
            : "We only share data with service providers necessary to operate the business, such as payment platforms, email delivery, storage infrastructure, fraud tools, and support services. We do not sell personal data."
        },
        {
          title: vi ? "4. Lưu trữ và bảo mật" : "4. Retention and security",
          body: vi
            ? "Dữ liệu đơn hàng và license có thể được lưu trong thời gian cần thiết để vận hành, hỗ trợ khách hàng, xử lý tranh chấp, hoàn tiền và tuân thủ pháp luật. Chúng tôi áp dụng giới hạn truy cập, ghi log hoạt động quan trọng và các biện pháp bảo vệ hợp lý để giảm rủi ro truy cập trái phép."
            : "Order and license data may be retained as long as needed to operate the service, support customers, resolve disputes, process refunds, and comply with law. We use access controls, audit logging, and reasonable safeguards to reduce unauthorized access risks."
        },
        {
          title: vi ? "5. Quyền của bạn" : "5. Your rights",
          body: vi
            ? "Bạn có thể yêu cầu xem lại, cập nhật hoặc xóa thông tin cá nhân trong phạm vi pháp luật cho phép. Nếu cần hỗ trợ, hãy liên hệ qua email hỗ trợ hiển thị trên website."
            : "You may request access, correction, or deletion of your personal information where permitted by law. If you need help, contact us using the support email shown on the website."
        }
      ]}
    />
  );
}
