import { getStorefrontLocale } from "@/modules/i18n/storefront";
import { StaticPage } from "@/components/storefront/static-page";

export default async function DownloadPage() {
  const locale = await getStorefrontLocale();
  const vi = locale === "vi";
  return (
    <StaticPage
      eyebrow={vi ? "Tải xuống" : "Download"}
      title={vi ? "Bản macOS Hang Cú video" : "Hang Cú video for macOS"}
      intro={vi ? "Tải bản dùng thử hoặc xem bản cài đặt hiện tại của ứng dụng." : "Download the trial build or review the current app release."}
      sections={[
        {
          title: vi ? "Phiên bản hiện tại" : "Current version",
          list: vi
            ? [
                "Phiên bản 1.0.",
                "Dung lượng app khoảng 20-30 MB tùy bản build.",
                "Hỗ trợ Apple Silicon và Intel.",
                "Yêu cầu macOS 14+.",
                "SHA-256 checksum sẽ được công bố cùng file tải xuống."
              ]
            : [
                "Version 1.0.",
                "App size is about 20-30 MB depending on the build.",
                "Supports Apple Silicon and Intel.",
                "Requires macOS 14+.",
                "The SHA-256 checksum will be published with the download file."
              ]
        },
        {
          title: vi ? "Cách cài đặt" : "How to install",
          body: vi
            ? "Kéo ứng dụng vào Applications rồi mở trực tiếp. Nếu Gatekeeper cảnh báo, hãy bấm chuột phải > Open. Không cần tắt bảo mật toàn hệ thống."
            : "Drag the app into Applications and launch it directly. If Gatekeeper warns, use right-click > Open. You do not need to disable system security."
        }
      ]}
      footer={
        <div className="space-y-4">
          <a
            href="/downloads/hangcuvideo.dmg"
            download
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            {vi ? "Tải app .dmg" : "Download .dmg app"}
          </a>
          <p className="text-center text-sm text-slate-500">
            {vi
              ? "Link này đang tải trực tiếp file cài đặt chính thức."
              : "This link downloads the official installer directly."}
          </p>
        </div>
      }
    />
  );
}
