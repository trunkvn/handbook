# handbook-interview

Sổ tay ôn tập phỏng vấn Frontend: hơn 200 câu hỏi, đáp án song ngữ Anh–Việt, khung trả lời, chế độ luyện tập, tìm kiếm và theo dõi tiến độ.

Next.js (App Router) · React 19 · TypeScript · pnpm.

```bash
pnpm dev      # http://localhost:3000
pnpm build && pnpm start
pnpm lint
```

## Cấu trúc

Mỗi phần (Part) là một route riêng: `/` là danh sách các phần, `/<slug>` là trang của một phần (ví dụ `/javascript-core`).

```
src/
  app/
    page.tsx            # trang chủ: giới thiệu + danh sách các phần
    [part]/page.tsx     # trang một phần; mọi slug được prerender lúc build
    layout.tsx          # topbar + sidebar dùng chung
  content/
    parts/NN-*.json     # nội dung: mỗi file là một phần (Part) chứa các câu hỏi
    parts.ts            # thứ tự các phần theo file (số La Mã gốc)
    groups.ts           # các phần được nhóm thế nào trong sidebar / trang chủ
    exercises.ts        # bài tập viết code (starter + test), khoá theo id câu hỏi
    types.ts            # kiểu Part / Question
  components/handbook/
    *-card, part-section, answer-columns, masthead, part-index, part-pager   # Server Component: nội dung tĩnh
    card-shell, parts-nav, search-*, *-switch, progress, code-playground     # Client Component: phần tương tác
  lib/
    handbook-store.ts   # state ngôn ngữ / luyện tập / theme / tiến độ / tìm kiếm (localStorage)
    search.ts           # tìm kiếm toàn văn, chỉ tải khi người dùng bắt đầu tìm
    code-runner/        # chạy code của người dùng trong Web Worker
  app/handbook.css      # toàn bộ giao diện
```

## Thêm hoặc sửa câu hỏi

Mở file JSON của phần tương ứng trong `src/content/parts/` và thêm một object vào `questions`:

```jsonc
{
  "id": "q100",            // duy nhất và không đổi: dùng làm anchor và khoá lưu tiến độ
  "number": 100,
  "tag": "Chủ đề · Nhóm nhỏ",
  "title": "Câu hỏi tiếng Anh (cho phép <code>…</code>)",
  "titleVi": "Bản dịch tiếng Việt",
  "framework": { "title": "Khung trả lời", "steps": ["Bước 1", "Bước 2"] },
  "answer": { "en": "<p>HTML…</p>", "vi": "<p>HTML…</p>" },
  "terms": ["từ khoá"]
}
```

- Dùng `<strong class="k">…</strong>` để đánh dấu ý bắt buộc phải nhắc tới.
- Thêm `"extras": [{ "title", "en", "vi" }]` nếu cần một phần mở rộng dưới đáp án.
- Nội dung HTML do repo này tự viết nên được render trực tiếp, đừng đưa nội dung từ người dùng vào đây.
- Phần mới: tạo file JSON mới rồi import vào `src/content/parts.ts`.

Tiến độ "Đã thuộc" lưu trong `localStorage` (key `interview-handbook-v1`) theo `id` câu hỏi.
- Phần mới: tạo file JSON mới (có `slug`), import vào `src/content/parts.ts`, rồi thêm slug vào một nhóm trong `src/content/groups.ts` (thiếu là build báo lỗi).

## Viết code trực tiếp trên trang

Câu nào có mục trong `src/content/exercises.ts` sẽ hiện nút "Viết code trực tiếp": mở trình soạn code (CodeMirror), bấm "Chạy test" hoặc Ctrl/⌘ + Enter. Code chạy trong Web Worker nên vòng lặp vô hạn chỉ làm worker bị dừng sau 6 giây, không làm đơ trang. Code đang viết được lưu trong `localStorage` (key `interview-handbook-code-v1`).

Thêm một bài tập:

```ts
q101: {
  starter: `function twoSum(nums, target) {\n\n}\n`,   // code ban đầu trong editor
  tests: `
    cases(twoSum, [
      [[[2, 7, 11, 15], 9], [0, 1]],   // [danh sách đối số, kết quả kỳ vọng]
    ], "same");                         // "same": bỏ qua thứ tự phần tử
  `,
},
```

Test được viết bằng JS và chạy cùng scope với code của người dùng nên gọi hàm theo tên. Các hàm hỗ trợ (xem `src/lib/code-runner/harness.ts`): `test(tên, fn)`, `eq(thực tế, kỳ vọng)`, `same(...)` (không phân biệt thứ tự), `cases(fn, hàng, "same"?)`, `wait(ms)`, và `ListNode`/`list()`/`toArray()`, `TreeNode`/`tree()` cho danh sách liên kết và cây nhị phân.

Mỗi bài nên được kiểm chứng: lời giải mẫu trong thẻ phải qua hết test, và vài lời giải sai phải bị bắt.

## Nghe đọc

Mỗi cột đáp án có nút loa "Nghe" cạnh nút Copy. Giọng đọc dùng Web Speech API (`speechSynthesis`) của trình duyệt nên không cần server hay API key; chất lượng giọng phụ thuộc vào các giọng đã cài trên thiết bị. Nút và phần cài đặt sẽ tự ẩn nếu trình duyệt không hỗ trợ.

- Phần đang đọc được tô sáng; code block được bỏ qua; bấm lại để dừng; chỉ một cột được đọc tại một thời điểm.
- "Giọng đọc" trong sidebar chọn tốc độ và giọng cho tiếng Anh và tiếng Việt (có nút Nghe thử), lưu cùng các tuỳ chọn khác trong `localStorage`.
- Máy chưa có giọng tiếng Việt thì nút báo rõ thay vì đọc sai; macOS và iOS có sẵn giọng Vietnamese, Windows và Android cần cài thêm.
- Mã nằm ở `src/lib/speech.ts` (điều khiển phát), `src/lib/speech-text.ts` (làm sạch và cắt văn bản thành đoạn ngắn, vì Chrome tự dừng khi một lần đọc quá dài) và `src/components/handbook/speak-button.tsx`.
