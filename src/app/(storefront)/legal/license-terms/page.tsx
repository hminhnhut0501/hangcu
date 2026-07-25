import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { StaticPage } from "@/components/storefront/static-page";

export default async function LicenseTermsPage() {
  const locale = await getStorefrontLocale();
  const vi = locale === "vi";

  return (
    <StaticPage
      eyebrow={vi ? "Điều khoản license" : "License Agreement"}
      title={vi ? "Quyền sử dụng license và các giới hạn liên quan." : "License usage rights and related limits."}
      intro={vi ? "Khi mua Hang Cú video, bạn nhận được quyền sử dụng có giới hạn theo gói đã chọn." : "When you buy Hang Cú video, you receive a limited right to use the app under the selected plan."}
      sections={[
        {
          title: vi ? "Gói 30 ngày" : "30-day license",
          body: vi
            ? "License 30 ngày là thanh toán một lần và hết hạn sau 30 ngày kể từ lúc kích hoạt, trừ khi mô tả gói nêu khác đi. Không có tự động gia hạn."
            : "The 30-day license is a one-time payment and expires 30 days after activation unless the plan description states otherwise. There is no automatic renewal."
        },
        {
          title: vi ? "Gói trọn đời" : "Lifetime license",
          body: vi
            ? "License trọn đời cấp quyền sử dụng vĩnh viễn cho dòng ứng dụng đã mua. Các phiên bản lớn trong tương lai có thể áp dụng chính sách nâng cấp riêng nếu trang sản phẩm không cam kết khác."
            : "The lifetime license grants permanent use for the purchased app line. Major future versions may follow a separate upgrade policy unless the product page states otherwise."
        },
        {
          title: vi ? "Giới hạn thiết bị" : "Device limits",
          body: vi
            ? "Mỗi license có thể bị giới hạn trên một số thiết bị nhất định. Người dùng có thể hủy kích hoạt máy cũ và chuyển license sang máy mới theo quy tắc trong ứng dụng hoặc trên website."
            : "Each license may be limited to a defined number of devices. You may deactivate an old machine and transfer the license to a new machine according to the rules shown in the app or on the website."
        },
        {
          title: vi ? "Cách dùng được phép" : "Allowed use",
          list: vi
            ? [
                "Chỉ dùng phần mềm trên số thiết bị được phép.",
                "Giữ bí mật license key.",
                "Liên hệ hỗ trợ nếu kích hoạt lỗi hoặc cần chuyển máy."
              ]
            : [
                "Use the software only on the permitted devices.",
                "Keep your license key private.",
                "Contact support if activation fails or you need a device transfer."
              ]
        },
        {
          title: vi ? "Cách dùng bị cấm" : "Prohibited use",
          list: vi
            ? [
                "Bán lại, đăng công khai, hoặc chia sẻ key.",
                "Reverse engineer, vượt qua hoặc lạm dụng hệ thống license.",
                "Dùng script hoặc tự động hóa để lách giới hạn thiết bị."
              ]
            : [
                "Resell, publish, or share the key publicly.",
                "Reverse engineer, bypass, or abuse the license system.",
                "Use automation or scripts to circumvent device limits."
              ]
        },
        {
          title: vi ? "Thu hồi" : "Revocation",
          body: vi
            ? "Chúng tôi có thể thu hồi license nếu phát hiện gian lận, abuse chargeback, vi phạm chính sách lặp lại, hoặc chia sẻ trái phép. Quyền hoàn tiền tuân theo Chính sách hoàn tiền."
            : "We may revoke a license if we detect fraud, chargeback abuse, repeated policy violations, or unauthorized sharing. Refund eligibility is governed by the Refund Policy."
        }
      ]}
    />
  );
}
