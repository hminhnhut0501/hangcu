import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { StaticPage } from "@/components/storefront/static-page";

export default async function TermsPage() {
  const locale = await getStorefrontLocale();
  const vi = locale === "vi";

  return (
    <StaticPage
      eyebrow={vi ? "Điều khoản sử dụng" : "Terms of Service"}
      title={
        vi
          ? "Điều khoản rõ ràng cho việc mua, kích hoạt và sử dụng license phần mềm."
          : "Clear terms for buying, activating, and using the software license."
      }
      intro={
        vi
          ? "Trang này mô tả sản phẩm, cách thanh toán, phạm vi license và các quy tắc sử dụng."
          : "This page describes the product, payment flow, license scope, and usage rules."
      }
      sections={[
        {
          title: vi ? "1. Sản phẩm" : "1. Product",
          body: vi
            ? "Hang Cú video là ứng dụng macOS được bán theo hai lựa chọn license: 30 ngày và trọn đời. Gói hỗ trợ là tùy chọn và được tách riêng khỏi việc mua license."
            : "Hang Cú video is a macOS app sold with two license options: 30 days and lifetime. Support packages are optional and separate from the license purchase."
        },
        {
          title: vi ? "2. Thanh toán và giao hàng" : "2. Payment and delivery",
          list: vi
            ? [
                "License được gửi điện tử qua email sau khi thanh toán thành công.",
                "Thời gian giao thường là ngay lập tức hoặc trong vài phút, tùy vào cổng thanh toán.",
                "Bạn cần nhập email chính xác để nhận license và hướng dẫn kích hoạt."
              ]
            : [
                "The license is delivered electronically by email after successful payment.",
                "Delivery is usually immediate or within a few minutes, depending on the payment provider.",
                "Please enter a valid email address to receive the license and activation instructions."
              ]
        },
        {
          title: vi ? "3. Kích hoạt và sử dụng" : "3. Activation and use",
          list: vi
            ? [
                "License key chỉ được dùng cho mục đích hợp pháp và đúng phạm vi cấp phép.",
                "Người dùng không được chia sẻ, bán lại, phát tán hoặc cố gắng vượt qua cơ chế bảo vệ.",
                "Một số key có thể giới hạn số thiết bị hoặc số lần kích hoạt tùy theo gói.",
                "Chúng tôi có thể thu hồi license nếu phát hiện gian lận, abuse hoặc chargeback."
              ]
            : [
                "The license key may only be used legally and within the granted scope.",
                "You may not share, resell, distribute, or attempt to bypass the protection system.",
                "Some keys may be limited to a specific number of devices or activations.",
                "We may revoke a license if we detect fraud, abuse, or chargebacks."
              ]
        },
        {
          title: vi ? "4. Trách nhiệm người dùng" : "4. User responsibilities",
          body: vi
            ? "Bạn cần bảo quản email, hóa đơn và license key của mình. Chúng tôi không chịu trách nhiệm nếu bạn nhập sai email, làm mất quyền truy cập hộp thư, hoặc cài đặt ứng dụng trên môi trường không đáp ứng yêu cầu tối thiểu đã công bố."
            : "You are responsible for keeping your email, receipt, and license key safe. We are not responsible if you enter the wrong email, lose access to your inbox, or install the app on a system that does not meet the published minimum requirements."
        },
        {
          title: vi ? "5. Hoàn tiền và tranh chấp" : "5. Refunds and disputes",
          body: vi
            ? "Hoàn tiền được xử lý theo Refund Policy riêng. Nếu có lỗi thanh toán, lỗi giao key hoặc vấn đề kích hoạt, hãy liên hệ hỗ trợ sớm để chúng tôi xác minh và xử lý đúng quy trình."
            : "Refunds are handled under the separate Refund Policy. If there is a payment issue, delivery issue, or activation problem, contact support early so we can verify and handle it properly."
        },
        {
          title: vi ? "6. Cập nhật điều khoản" : "6. Updates to these terms",
          body: vi
            ? "Chúng tôi có thể cập nhật điều khoản khi sản phẩm, pháp luật hoặc quy trình thanh toán thay đổi. Phiên bản mới sẽ có hiệu lực từ thời điểm được đăng trên website."
            : "We may update these terms if the product, law, or payment process changes. The new version takes effect when published on the website."
        }
      ]}
    />
  );
}
