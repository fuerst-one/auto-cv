import { getCvProjects } from "@/server/notion/getCvProjects";
import { renderCvPdf } from "./renderCvPdf";
import { NextResponse } from "next/server";

// This route will create a PDF from the CV projects
export const GET = async () => {
  const projects = await getCvProjects();

  const pdfBuffer = await renderCvPdf(projects);

  // Streaming our resulting pdf back to the user
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=cv.pdf",
    },
  });
};
