import type { Metadata } from "next";
import { ReviewList, type ReviewGroup } from "@/components/handbook/review-list";
import { formatNumber, groups, htmlToText } from "@/content";

export const metadata: Metadata = {
  title: "Đã thuộc",
  description: "Xem lại các câu hỏi bạn đã đánh dấu là đã thuộc.",
};

// Only titles go to the browser here; the full answers are fetched when someone opens a quick preview.
const index: ReviewGroup[] = groups.map((group) => ({
  id: group.id,
  title: group.title,
  parts: group.parts.map((part) => ({
    slug: part.slug,
    title: part.title,
    questions: part.questions.map((q) => ({
      id: q.id,
      number: formatNumber(q.number),
      title: htmlToText(q.title),
      tag: q.tag,
    })),
  })),
}));

export default function ReviewPage() {
  return (
    <section className="review">
      <header className="part-head">
        <p className="eyebrow">Ôn tập</p>
        <h1>Đã thuộc</h1>
        <p>
          Những câu bạn đã tick “Đã thuộc”, gom lại một chỗ để ôn nhanh. Bấm “Xem nhanh” để đọc lại
          đáp án ngay tại đây, hoặc mở câu đó trong phần của nó.
        </p>
      </header>
      <ReviewList groups={index} />
    </section>
  );
}
