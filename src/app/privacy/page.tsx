export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="space-y-8">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Privacy Policy / Chính sách bảo mật
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
            Chúng tôi chỉ thu thập dữ liệu cần thiết để xử lý đơn hàng và giao license.
          </h1>
          <p className="text-lg leading-8 text-slate-600">
            This policy explains what we collect, why we collect it, and how we use it to
            deliver software licenses, support customers, and operate the store safely.
          </p>
        </header>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">1. Thông tin chúng tôi thu thập</h2>
          <ul className="space-y-2 text-slate-600">
            <li>• Email, tên hiển thị, thông tin đơn hàng, trạng thái thanh toán và lịch sử giao dịch.</li>
            <li>• Nội dung trao đổi hỗ trợ nếu bạn chủ động liên hệ qua email hoặc biểu mẫu liên hệ.</li>
            <li>• Dữ liệu kỹ thuật tối thiểu như IP, thiết bị, trình duyệt, log lỗi và sự kiện bảo mật.</li>
          </ul>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">2. Mục đích sử dụng</h2>
          <ul className="space-y-2 text-slate-600">
            <li>• Xử lý thanh toán và gửi license/key qua email.</li>
            <li>• Kích hoạt, xác minh, khôi phục hoặc thu hồi license khi cần.</li>
            <li>• Hỗ trợ cài đặt, xử lý lỗi, hoàn tiền, chống gian lận và chargeback.</li>
            <li>• Cải thiện trải nghiệm sản phẩm và tuân thủ nghĩa vụ kế toán, thuế, pháp lý.</li>
          </ul>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">3. Chia sẻ dữ liệu</h2>
          <p className="text-slate-600">
            Chúng tôi chỉ chia sẻ dữ liệu với các bên cần thiết để vận hành dịch vụ, ví dụ nền tảng
            thanh toán, email delivery, hạ tầng lưu trữ, công cụ chống gian lận và dịch vụ hỗ trợ.
            Chúng tôi không bán dữ liệu cá nhân.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">4. Lưu trữ và bảo mật</h2>
          <p className="text-slate-600">
            Dữ liệu đơn hàng và license có thể được lưu trong thời gian cần thiết để vận hành,
            hỗ trợ khách hàng, xử lý tranh chấp, hoàn tiền và tuân thủ pháp luật. Chúng tôi áp dụng
            giới hạn truy cập, ghi log hoạt động quan trọng và các biện pháp bảo vệ hợp lý để giảm
            rủi ro truy cập trái phép.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">5. Quyền của bạn</h2>
          <p className="text-slate-600">
            Bạn có thể yêu cầu xem lại, cập nhật hoặc xóa thông tin cá nhân trong phạm vi pháp luật
            cho phép. Nếu cần hỗ trợ, hãy liên hệ qua email hỗ trợ hiển thị trên website.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">6. Dữ liệu sản phẩm số</h2>
          <p className="text-slate-600">
            License key, trạng thái kích hoạt, lịch sử cấp lại và sự kiện bảo mật có thể được lưu
            để đảm bảo tính hợp lệ của giao dịch và hỗ trợ hậu mãi. Ứng dụng Hang Cú video không
            cần chúng tôi truy cập vào nội dung cá nhân của bạn để kích hoạt license.
          </p>
        </section>
      </div>
    </main>
  );
}
