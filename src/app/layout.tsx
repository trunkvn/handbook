import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DocumentSync } from "@/components/handbook/document-sync";
import { Sidebar } from "@/components/handbook/sidebar";
import { Topbar } from "@/components/handbook/topbar";
import { STORAGE_KEY } from "@/lib/storage-key";
import "./globals.css";
import "./handbook.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext", "vietnamese"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext", "vietnamese"],
});

export const metadata: Metadata = {
  title: {
    default: "Frontend Interview Handbook",
    template: "%s · Frontend Interview Handbook",
  },
  description:
    "Sổ tay ôn tập phỏng vấn Frontend: câu hỏi, đáp án song ngữ Anh–Việt, khung trả lời, viết code trực tiếp và chế độ luyện tập.",
};

// Runs before first paint so saved theme, language and practice mode never flash the defaults.
const initSettings = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})||"{}"),r=document.documentElement;r.dataset.theme=s.theme==="light"?"light":"dark";r.dataset.lang=s.lang==="en"||s.lang==="vi"?s.lang:"both";if(s.practice===true)r.dataset.practice="true"}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      data-theme="dark"
      data-lang="both"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: initSettings }} />
      </head>
      <body>
        <DocumentSync />
        <Topbar />
        <div id="top" />
        <div className="layout">
          <Sidebar />
          <main>
            <div className="wrap">
              {children}
              <footer className="page-foot">
                Gợi ý: nói to đáp án bằng lời của chính bạn. Khung trả lời quan trọng hơn việc thuộc
                từng chữ.
              </footer>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
