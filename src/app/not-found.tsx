import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found">
      <h1>Không tìm thấy trang</h1>
      <p>
        Phần bạn tìm không tồn tại. <Link href="/">Quay về danh sách các phần</Link>.
      </p>
    </section>
  );
}
