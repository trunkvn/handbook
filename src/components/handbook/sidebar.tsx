import { formatNumber, groups, htmlToText, parts } from "@/content";
import { LangSwitch } from "./lang-switch";
import { PartsNav, type NavGroup } from "./parts-nav";
import { PracticeSwitch } from "./practice-switch";
import { Progress } from "./progress";
import { SpeechSettings } from "./speech-settings";
import { SearchBox } from "./search-box";

const navGroups: NavGroup[] = groups.map((group) => ({
  id: group.id,
  title: group.title,
  parts: group.parts.map((part) => ({
    slug: part.slug,
    title: part.title,
    questions: part.questions.map((q) => ({
      id: q.id,
      number: formatNumber(q.number),
      title: htmlToText(q.title),
    })),
  })),
}));

const ids = parts.flatMap((p) => p.questions.map((q) => q.id));

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Công cụ học và mục lục">
      <span className="ctl-label" id="lbl-lang">
        Ngôn ngữ hiển thị
      </span>
      <LangSwitch />

      <PracticeSwitch />

      <SpeechSettings />

      <span className="ctl-label">Tìm kiếm</span>
      <SearchBox />

      <span className="ctl-label">Tiến độ</span>
      <Progress ids={ids} />

      <PartsNav groups={navGroups} />
    </aside>
  );
}
