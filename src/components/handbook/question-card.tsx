import { formatNumber } from "@/content";
import { exercises } from "@/content/exercises";
import type { Question } from "@/content/types";
import { AnswerColumns } from "./answer-columns";
import { CardShell } from "./card-shell";
import { CodePlayground } from "./code-playground";
import { DoneToggle } from "./done-toggle";

export function QuestionCard({ question: q }: { question: Question }) {
  const exercise = exercises[q.id];
  return (
    <CardShell
      id={q.id}
      playground={
        exercise && <CodePlayground id={q.id} starter={exercise.starter} tests={exercise.tests} />
      }
      header={
        <>
          <div className="card-meta">
            <span className="num">Câu {formatNumber(q.number)}</span>
            <span className="tag">{q.tag}</span>
          </div>
          <h3 dangerouslySetInnerHTML={{ __html: q.title }} />
          <p className="q-vi" dangerouslySetInnerHTML={{ __html: q.titleVi }} />
        </>
      }
      answer={
        <>
          <div className="framework">
            <h4>{q.framework.title}</h4>
            <ol>
              {q.framework.steps.map((step, i) => (
                <li key={i}>
                  {/* One grid item for the whole step, so inline <code> does not become its own column. */}
                  <span dangerouslySetInnerHTML={{ __html: step }} />
                </li>
              ))}
            </ol>
          </div>
          <AnswerColumns {...q.answer} />
          {q.extras?.map((extra) => (
            <div className="extra" key={extra.title}>
              <p className="extra-title">{extra.title}</p>
              <AnswerColumns en={extra.en} vi={extra.vi} />
            </div>
          ))}
        </>
      }
      footer={
        <div className="card-foot">
          <div className="terms">
            {q.terms.map((term) => (
              <span key={term}>{term}</span>
            ))}
          </div>
          <DoneToggle id={q.id} />
        </div>
      }
    />
  );
}
