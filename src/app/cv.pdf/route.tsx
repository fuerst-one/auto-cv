import { getCvProjects } from "@/server/notion/getCvProjects";
import { renderCvPdf } from "./renderCvPdf";
import { NextRequest, NextResponse } from "next/server";
import { resolvePreset, sortAndCapForPreset } from "@/components/Cv/cvPresets";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = async (request: NextRequest) => {
  const allProjects = await getCvProjects();

  const preset = resolvePreset(request.nextUrl.searchParams.get("preset"));
  const featuredProjects = sortAndCapForPreset(allProjects, preset);

  const pdfBuffer = await renderCvPdf({ featuredProjects, allProjects });
  const pdfUint8Array = new Uint8Array(pdfBuffer);

  return new NextResponse(pdfUint8Array, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=cv-${preset.id}.pdf`,
    },
  });
};
