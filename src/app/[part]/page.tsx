import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartPager } from "@/components/handbook/part-pager";
import { PartSection } from "@/components/handbook/part-section";
import { getPart, htmlToText, parts } from "@/content";

// Every real slug is prerendered, so navigating to a part is instant. Only an unknown slug (typo, old link)
// is resolved at request time; opt out of the dev-only instant check, which flags that case. Wrapping the
// content in <Suspense> instead would delay it past the router's scroll to `#question` links.
export const instant = false;

export function generateStaticParams() {
  return parts.map((p) => ({ part: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[part]">): Promise<Metadata> {
  const part = getPart((await params).part);
  if (!part) return {};
  return { title: part.title, description: htmlToText(part.description) };
}

export default async function PartPage({ params }: PageProps<"/[part]">) {
  const part = getPart((await params).part);
  if (!part) notFound();

  return (
    <>
      <PartSection part={part} />
      <PartPager slug={part.slug} />
    </>
  );
}
