import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { StaticPage } from "@/components/storefront/static-page";

export default async function ContactPage() {
  const locale = await getStorefrontLocale();
  const vi = locale === "vi";

  return (
    <StaticPage
      eyebrow={vi ? "Liên hệ" : "Contact"}
      title={vi ? "Liên hệ hỗ trợ" : "Contact support"}
      intro={
        vi
          ? "Dùng email hoặc Telegram bên dưới nếu bạn cần hỏi về license, thanh toán, kích hoạt hay hoàn tiền."
          : "Use the email or Telegram below if you need help with licenses, payment, activation, or refunds."
      }
      sections={[
        {
          title: vi ? "Kênh hỗ trợ" : "Support channels",
          list: vi
            ? ["Email: hangcuvip@gmail.com", "Telegram: t.me/cuhotro_bot", "Thời gian phản hồi thường trong 1-2 ngày làm việc."]
            : ["Email: hangcuvip@gmail.com", "Telegram: t.me/cuhotro_bot", "We usually respond within 1-2 business days."]
        }
      ]}
    />
  );
}
