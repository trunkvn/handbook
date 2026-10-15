import { parts, totalQuestions } from "@/content";

export function Masthead() {
  return (
    <header className="masthead">
      <p className="eyebrow">Tài liệu ôn tập</p>
      <h1>Phỏng vấn Frontend</h1>
      <p className="lede">
        {totalQuestions} câu hỏi, nhóm theo chủ đề: dự án thực tế (thanh toán, xác thực, bảo mật,
        kiến trúc), JavaScript, TypeScript, React, Next.js, Vue và Nuxt, hiệu năng web, testing,
        accessibility, design system, Git, Agile và TDD, viết code, LeetCode và mẹo phỏng vấn. Mỗi
        câu gồm khung trả lời, đáp án tiếng Anh và bản dịch tiếng Việt.
      </p>
      <div className="abstract" role="note">
        <h2>Cách học hiệu quả</h2>
        <ul>
          <li>
            Bật <strong>Chế độ luyện tập</strong>, đọc câu hỏi và tự trả lời thành tiếng trước khi
            bấm “Hiện đáp án”.
          </li>
          <li>
            Học <strong>khung trả lời</strong> (các bước đánh số) trước, vì khung giúp bạn nhớ cấu
            trúc chứ không cần học thuộc từng chữ.
          </li>
          <li>
            Các cụm được <strong className="k">đánh dấu</strong> là ý bắt buộc phải nhắc tới. Tick
            “Đã thuộc” để theo dõi tiến độ; trạng thái được lưu trên trình duyệt này.
          </li>
        </ul>
      </div>
      <div className="stats" aria-hidden="true">
        <div className="stat">
          <b>{totalQuestions}</b>
          <span>câu hỏi</span>
        </div>
        <div className="stat">
          <b>{parts.length}</b>
          <span>chủ đề</span>
        </div>
        <div className="stat">
          <b>2</b>
          <span>ngôn ngữ</span>
        </div>
      </div>
    </header>
  );
}
