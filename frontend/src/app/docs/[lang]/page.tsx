import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { withTimeout } from "@/lib/utils";

export const revalidate = 3600; // cache 1 hour — redirect rarely changes

export default async function DocLangPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();

  const { data: firstPage } = await withTimeout(
    Promise.resolve(
      supabase
        .from("doc_topics")
        .select("slug")
        .eq("lang", lang)
        .order("order_index", { ascending: true })
        .limit(1)
        .single()
    ),
    8000
  );

  if (!firstPage) {
    redirect("/docs");
  }

  redirect(`/docs/${lang}/${firstPage.slug}`);
}
