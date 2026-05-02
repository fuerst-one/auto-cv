import { Font } from "@react-pdf/renderer";
import path from "path";

const fontPath = (filename: string) =>
  path.join(process.cwd(), "public", "fonts", filename);

Font.register({
  family: "IBM Plex Mono",
  fonts: [
    { src: fontPath("IBMPlexMono-Regular.ttf"), fontWeight: 400 },
    { src: fontPath("IBMPlexMono-Medium.ttf"), fontWeight: 500 },
    { src: fontPath("IBMPlexMono-Bold.ttf"), fontWeight: 700 },
  ],
});
