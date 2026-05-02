import { getCvProjects } from "@/server/notion/getCvProjects";
import { renderCvPdf } from "./renderCvPdf";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// This route will create a PDF from the CV projects
export const GET = async () => {
  const TOP_N = 4;
  const allProjects = await getCvProjects();
  const featuredProjects = allProjects
    .filter((p) => p.featured)
    .sort((a, b) => {
      if (b.wowFactor !== a.wowFactor) {
        return b.wowFactor - a.wowFactor;
      }
      return (b.startDate ?? "").localeCompare(a.startDate ?? "");
    })
    .slice(0, TOP_N);

  const pdfBuffer = await renderCvPdf({
    featuredProjects,
    allProjects,
  });

  // Convert Node Buffer (from @react-pdf/renderer) to Uint8Array for Web Response
  const pdfUint8Array = new Uint8Array(pdfBuffer);

  // Streaming our resulting pdf back to the user
  return new NextResponse(pdfUint8Array, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=cv.pdf",
    },
  });
};
