import type { Metadata } from "next";
import { Layout } from "@/components/Layout";
import { PresetPicker, PresetOption } from "@/components/Cv/PresetPicker";
import { IconLink } from "@/components/IconLink";
import { FaEnvelope } from "@react-icons/all-files/fa/FaEnvelope";
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin";
import { FaGithub } from "@react-icons/all-files/fa/FaGithub";
import { getCachedCvProjects } from "@/server/notion/getCachedCvProjects";
import { filterProjects } from "@/components/Cv/Projects/Filter/utils";
import { CV_PRESET_ORDER, CV_PRESETS } from "@/components/Cv/cvPresets";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Contact | Alexander Fuerst",
  description:
    "Get in touch and download a tailored PDF CV — Highlights, Frontend Engineer, Data Visualization, or E-Commerce & CRO presets.",
  alternates: { canonical: "https://fuerst.one/contact" },
};

export default async function ContactPage() {
  const projects = await getCachedCvProjects();
  const presets: PresetOption[] = CV_PRESET_ORDER.map((id) => {
    const preset = CV_PRESETS[id];
    const matched = filterProjects(projects, preset.filter);
    const matchedCount = preset.topN
      ? Math.min(preset.topN, matched.length)
      : matched.length;
    return { ...preset, matchedCount };
  });

  return (
    <Layout>
      <div className="space-y-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Get in touch · Download my CV
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-300">
            Drop your email below and pick a preset to download a tailored PDF
            of my CV. The presets filter the project selection so you only see
            work that matches what you&apos;re hiring for. Your email lands in
            my inbox so I can follow up.
          </p>
        </header>

        <PresetPicker presets={presets} />

        <section className="space-y-4 border-t border-white/20 pt-8">
          <h2 className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Other ways to reach me
          </h2>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <IconLink
              href="mailto:alexander@fuerst.one"
              icon={FaEnvelope}
              className="flex-none"
            >
              alexander@fuerst.one
            </IconLink>
            <IconLink
              href="https://www.linkedin.com/in/fuerst-one/"
              icon={FaLinkedin}
              className="flex-none"
            >
              LinkedIn
            </IconLink>
            <IconLink
              href="https://github.com/fuerst-one"
              icon={FaGithub}
              className="flex-none"
            >
              GitHub
            </IconLink>
          </div>
        </section>
      </div>
    </Layout>
  );
}
