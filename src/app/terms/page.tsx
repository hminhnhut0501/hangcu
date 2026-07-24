export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="space-y-8">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Terms of Service / Điều khoản sử dụng
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
            Điều khoản rõ ràng cho việc mua, kích hoạt và sử dụng license phần mềm.
          </h1>
          <p className="text-lg leading-8 text-slate-600">
            These terms are written to be clear for customers and payment reviewers: we sell
            digital software licenses, not physical goods or vague membership access.
          </p>
        </header>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">1. Sản phẩm</h2>
          <p className="text-slate-600">
            Hang Cú video is a macOS software product sold with two license options: a 30-day
            license and a lifetime license. Support packages are optional and separate from the
            core license purchase.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">2. Thanh toán và giao hàng</h2>
          <ul className="space-y-2 text-slate-600">
            <li>• License được gửi điện tử qua email sau khi thanh toán thành công.</li>
            <li>• Thời gian giao thường là ngay lập tức hoặc trong vài phút, tùy vào cổng thanh toán.</li>
            <li>• Bạn cần nhập email chính xác để nhận license và hướng dẫn kích hoạt.</li>
          </ul>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">3. Kích hoạt và sử dụng</h2>
          <ul className="space-y-2 text-slate-600">
            <li>• License key chỉ được dùng cho mục đích hợp pháp và đúng phạm vi cấp phép.</li>
            <li>• Người dùng không được chia sẻ, bán lại, phát tán hoặc cố gắng vượt qua cơ chế bảo vệ.</li>
            <li>• Một số key có thể giới hạn số thiết bị hoặc số lần kích hoạt tùy theo gói.</li>
            <li>• Chúng tôi có thể thu hồi license nếu phát hiện gian lận, abuse hoặc chargeback.</li>
          </ul>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">4. Trách nhiệm người dùng</h2>
          <p className="text-slate-600">
            Bạn cần bảo quản email, hóa đơn và license key của mình. Chúng tôi không chịu trách
            nhiệm nếu bạn nhập sai email, làm mất quyền truy cập hộp thư, hoặc cài đặt ứng dụng trên
            môi trường không đáp ứng yêu cầu tối thiểu đã công bố.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">5. Hoàn tiền và tranh chấp</h2>
          <p className="text-slate-600">
            Hoàn tiền được xử lý theo Refund Policy riêng. Nếu có lỗi thanh toán, lỗi giao key hoặc
            vấn đề kích hoạt, hãy liên hệ hỗ trợ sớm để chúng tôi xác minh và xử lý đúng quy trình.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">6. Cập nhật điều khoản</h2>
          <p className="text-slate-600">
            Chúng tôi có thể cập nhật điều khoản khi sản phẩm, pháp luật hoặc quy trình thanh toán
            thay đổi. Phiên bản mới sẽ có hiệu lực từ thời điểm được đăng trên website.
          </p>
        </section>
      </div>
    </main>
  );
}
