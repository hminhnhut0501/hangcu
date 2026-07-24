import Image from "next/image";
import { getStorefrontLocale } from "@/modules/i18n/storefront";

export default async function DownloadPage() {
  const locale = await getStorefrontLocale();
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <section className="space-y-5">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-blue-600">{locale === "vi" ? "Tải xuống" : "Download"}</p>
          <h1 className="text-4xl font-semibold tracking-tight">{locale === "vi" ? "Bản macOS Hang Cú video" : "Hang Cú video for macOS"}</h1>
          <p className="text-slate-600">{locale === "vi" ? "Tải bản dùng thử hoặc xem bản cài đặt hiện tại của ứng dụng." : "Download the trial build or review the current app release."}</p>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{locale === "vi" ? "Phiên bản hiện tại" : "Current version"}</p>
            <p className="mt-1 text-2xl font-semibold">1.0</p>
            <p className="mt-3 text-sm text-slate-500">{locale === "vi" ? "Dung lượng app: khoảng 20-30 MB tùy bản build." : "App size: about 20-30 MB depending on the build."}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>{locale === "vi" ? "Hỗ trợ Apple Silicon và Intel" : "Supports Apple Silicon and Intel"}</li>
              <li>{locale === "vi" ? "Yêu cầu macOS 14+" : "Requires macOS 14+"}</li>
              <li>{locale === "vi" ? "SHA-256 checksum sẽ được công bố cùng file tải xuống" : "SHA-256 checksum will be published with the download file"}</li>
            </ul>
            <p className="mt-4 text-sm text-slate-500">{locale === "vi" ? "Cách mở app: kéo vào Applications rồi mở trực tiếp. Nếu Gatekeeper cảnh báo, hãy mở từ menu chuột phải > Open." : "Open by dragging to Applications, then launch directly. If Gatekeeper warns, use right-click > Open."}</p>
            <p className="mt-3 text-sm text-slate-500">{locale === "vi" ? "Không cần tắt bảo mật toàn hệ thống." : "No need to disable system security."}</p>
          </div>
        </section>
        <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 to-slate-800 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <div className="rounded-[1.5rem] bg-white/5 p-4">
            <Image src="/brand/hangcu-hero-mockup.png" alt="Hang Cú video preview" width={1400} height={900} className="rounded-[1.25rem]" />
          </div>
        </div>
      </div>
    </main>
  );
}
