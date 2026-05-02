import { ReactNode } from "react";
import { Layout } from "@/components/Layout";
import { LangSwitcher } from "@/components/Legal/LangSwitcher";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <Layout>
      <div className="mb-8 flex justify-end">
        <LangSwitcher />
      </div>
      <article className="space-y-6 text-sm leading-relaxed text-neutral-300">
        {children}
      </article>
    </Layout>
  );
}
