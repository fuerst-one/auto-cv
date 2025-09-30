import { getCvProjects } from "@/server/notion/getCvProjects";
import { renderCvPdf } from "./renderCvPdf";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// This route will create a PDF from the CV projects
export const GET = async () => {
  const projects = await getCvProjects();

  const pdfBuffer = await renderCvPdf(projects);

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
