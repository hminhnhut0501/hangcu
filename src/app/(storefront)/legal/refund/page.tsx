import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { StaticPage } from "@/components/storefront/static-page";

export default async function RefundPage() {
  const locale = await getStorefrontLocale();
  const vi = locale === "vi";

  return (
    <StaticPage
      eyebrow={vi ? "Chính sách hoàn tiền" : "Refund Policy"}
      title={vi ? "Quy tắc hoàn tiền rõ ràng và nhất quán." : "Clear and consistent refund rules."}
      intro={vi ? "Chúng tôi xem xét hoàn tiền theo từng trường hợp dựa trên tình trạng giao key và điều kiện sản phẩm." : "We review refunds case by case based on key delivery and the product conditions."}
      sections={[
        {
          title: vi ? "Trường hợp có thể hoàn tiền" : "Refundable cases",
          list: vi
            ? [
                "License không được giao.",
                "Key không kích hoạt được và chúng tôi không khắc phục được.",
                "Khách bị trừ tiền hai lần cho cùng một đơn.",
                "Sản phẩm khác đáng kể so với mô tả trên website.",
                "Sản phẩm không tương thích dù website đã công bố rõ macOS và kiến trúc hỗ trợ."
              ]
            : [
                "The license was not delivered.",
                "The key cannot be activated and we cannot resolve the issue.",
                "The customer was charged twice for the same order.",
                "The product differs materially from the website description.",
                "The product is incompatible even though macOS and architecture support were clearly disclosed."
              ]
        },
        {
          title: vi ? "Trường hợp không hoàn tiền" : "Non-refundable cases",
          list: vi
            ? [
                "Mua nhầm sau khi key đã được giao.",
                "Lạm dụng license, chia sẻ hoặc bán lại key.",
                "Đổi ý sau khi kích hoạt hoặc tải xuống.",
                "Lỗi phát sinh do phần cứng hoặc phiên bản macOS không được hỗ trợ."
              ]
            : [
                "Accidental purchase after the key has been delivered.",
                "License misuse, sharing, or resale.",
                "Change of mind after activation or download.",
                "Issues caused by unsupported hardware or unsupported macOS versions."
              ]
        },
        {
          title: vi ? "Cách gửi yêu cầu" : "How to request",
          body: vi
            ? "Gửi email kèm mã đơn, email thanh toán và mô tả ngắn gọn vấn đề. Chúng tôi có thể yêu cầu ảnh chụp màn hình hoặc thông tin kích hoạt để xác minh."
            : "Send an email with your order number, checkout email, and a short description of the issue. We may ask for screenshots or activation details to verify the case."
        },
        {
          title: vi ? "Cách hoàn tiền" : "How refunds are issued",
          body: vi
            ? "Nếu được chấp thuận, tiền sẽ được hoàn về phương thức thanh toán gốc khi có thể."
            : "If approved, refunds are issued back to the original payment method whenever possible."
        }
      ]}
    />
  );
}
