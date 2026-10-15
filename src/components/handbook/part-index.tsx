import Link from "next/link";
import { groups } from "@/content";
import { PartCount } from "./part-count";

/** Home page: the parts, grouped by topic. */
export function PartIndex() {
  return (
    <div className="part-index">
      {groups.map((group) => {
        const ids = group.parts.flatMap((p) => p.questions.map((q) => q.id));
        return (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <h2 id={`group-${group.id}`} className="group-title">
              <span>{group.title}</span>
              <span className="group-meta">
                <PartCount ids={ids} /> câu
              </span>
            </h2>
            <ol>
              {group.parts.map((part) => (
                <li key={part.slug}>
                  <Link href={`/${part.slug}`}>
                    <span className="info">
                      <span className="title">{part.title}</span>
                      <span className="desc" dangerouslySetInnerHTML={{ __html: part.description }} />
                    </span>
                    <span className="meta">
                      <PartCount ids={part.questions.map((q) => q.id)} />
                      <span className="unit">câu</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
