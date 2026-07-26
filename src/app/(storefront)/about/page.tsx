import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { StaticPage } from "@/components/storefront/static-page";

export default async function AboutPage() {
  const locale = await getStorefrontLocale();
  const vi = locale === "vi";

  return (
    <StaticPage
      eyebrow={vi ? "Giới thiệu" : "About"}
      title={
        vi
          ? "Hang Cú video là ứng dụng macOS cho các tác vụ video cơ bản."
          : "Hang Cú video is a macOS app for core video tasks."
      }
      intro={
        vi
          ? "Ứng dụng xử lý cắt, nối, xuất thumbnail, tạo contact sheet và gắn watermark trực tiếp trên máy Mac."
          : "The app handles cutting, joining, thumbnail export, contact sheets, and watermarking directly on your Mac."
      }
      sections={[
        {
          title: vi ? "Sản phẩm" : "Product",
          body: vi
            ? "Chúng tôi bán license phần mềm, không bán membership hay quyền truy cập mơ hồ."
            : "We sell software licenses, not memberships or vague access rights."
        },
        {
          title: vi ? "Website" : "Website",
          body: vi
            ? "Trang web được thiết kế để khách xem sản phẩm, giá, hỗ trợ và chính sách mà không cần đăng nhập."
            : "The website is designed so customers can review the product, pricing, support, and policies without logging in."
        }
      ]}
    />
  );
}
