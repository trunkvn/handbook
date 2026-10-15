import Link from "next/link";
import { orderedParts } from "@/content";

/** Previous / next part links at the bottom of a part page, in sidebar order. */
export function PartPager({ slug }: { slug: string }) {
  const i = orderedParts.findIndex((p) => p.slug === slug);
  const prev = orderedParts[i - 1];
  const next = orderedParts[i + 1];
  if (!prev && !next) return null;

  return (
    <nav className="pager" aria-label="Chuyển phần">
      {prev ? (
        <Link href={`/${prev.slug}`} rel="prev" className="prev">
          <span className="dir">← Phần trước</span>
          <span className="name">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={`/${next.slug}`} rel="next" className="next">
          <span className="dir">Phần sau →</span>
          <span className="name">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
