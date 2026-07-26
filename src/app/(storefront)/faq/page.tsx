import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { StaticPage } from "@/components/storefront/static-page";

export default async function FaqPage() {
  const locale = await getStorefrontLocale();
  const vi = locale === "vi";

  return (
    <StaticPage
      eyebrow={vi ? "Câu hỏi thường gặp" : "FAQ"}
      title={vi ? "Những câu hỏi phổ biến" : "Common questions"}
      intro={
        vi
          ? "Các câu hỏi dưới đây giúp bạn hiểu cách mua license, nhận key và sử dụng app."
          : "These questions explain how to buy a license, receive a key, and use the app."
      }
      sections={[
        {
          title: vi ? "Gói 30 ngày có tự gia hạn không?" : "Does the 30-day plan auto-renew?",
          body: vi
            ? "Không. Gói 30 ngày là thanh toán một lần và không tự gia hạn, trừ khi trang sản phẩm ghi rõ khác đi."
            : "No. The 30-day plan is a one-time payment and does not auto-renew unless the product page clearly says otherwise."
        },
        {
          title: vi ? "License được giao như thế nào?" : "How is the license delivered?",
          body: vi
            ? "Sau khi thanh toán, license key sẽ được gửi qua email và ghi nhận trong admin dashboard để theo dõi hỗ trợ và kích hoạt."
            : "After payment, the license key is sent by email and recorded in the admin dashboard for support and activation tracking."
        },
        {
          title: vi ? "App có tải video của tôi lên server không?" : "Does the app upload my videos?",
          body: vi
            ? "Không. Hang Cú video xử lý file cục bộ trên máy Mac của bạn và không tải video lên server của chúng tôi."
            : "No. Hang Cú video processes files locally on your Mac and does not upload your videos to our servers."
        }
      ]}
    />
  );
}
