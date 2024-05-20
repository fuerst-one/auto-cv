import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(req: NextRequest) {
  // Launch a new browser instance
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const searchParams = new URLSearchParams(req.url).toString();

  // Navigate to the pdf-content page
  await page.goto(
    `${process.env.NEXT_PUBLIC_BASE_URL}/pdf-content${searchParams ? `?${searchParams}` : ""}`,
    {
      waitUntil: "networkidle0",
    },
  );

  await page.waitForSelector("footer");

  // Generate the PDF
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  // Close the browser instance
  await browser.close();

  // Set the response headers and send the PDF
  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=resume.pdf",
    },
  });
}
