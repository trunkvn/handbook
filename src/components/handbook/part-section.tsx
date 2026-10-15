import { getGroup } from "@/content";
import type { Part } from "@/content/types";
import { QuestionCard } from "./question-card";

export function PartSection({ part }: { part: Part }) {
  const group = getGroup(part.slug);
  return (
    <section className="part" id={part.id}>
      <header className="part-head">
        <span className="roman">
          {part.roman}
          {group && <span className="group-name"> · {group.title}</span>}
        </span>
        <h1>{part.title}</h1>
        <p dangerouslySetInnerHTML={{ __html: part.description }} />
      </header>
      {part.questions.map((q) => (
        <QuestionCard key={q.id} question={q} />
      ))}
    </section>
  );
}
