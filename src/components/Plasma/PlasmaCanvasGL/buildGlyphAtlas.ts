import TinySDF from "@mapbox/tiny-sdf";

const SDF_FONT_SIZE = 32;
const SDF_BUFFER = 4;
const SDF_RADIUS = 8;

export type GlyphAtlas = {
  data: Uint8Array;
  width: number;
  height: number;
  cols: number;
  rows: number;
  tileSize: number;
  fontSize: number;
  glyphIndex: Map<string, number>;
};

const resolveDocumentFontFamily = (fallback: string): string => {
  if (typeof document === "undefined") {
    return fallback;
  }
  const computed = getComputedStyle(document.body).fontFamily;
  return computed || fallback;
};

export const buildGlyphAtlas = (
  characters: readonly string[],
  fontFamily?: string,
): GlyphAtlas => {
  const resolvedFontFamily =
    fontFamily ?? resolveDocumentFontFamily("Menlo, monospace");
  const sdf = new TinySDF({
    fontSize: SDF_FONT_SIZE,
    buffer: SDF_BUFFER,
    radius: SDF_RADIUS,
    fontFamily: resolvedFontFamily,
    fontWeight: "400",
  });

  const tiles = characters.map((char) => sdf.draw(char));
  const tileSize = Math.max(
    ...tiles.flatMap((tile) => [tile.width, tile.height]),
  );

  const baselineYInTile = Math.round(tileSize / 2 + 0.28 * SDF_FONT_SIZE);

  const cols = Math.ceil(Math.sqrt(characters.length));
  const rows = Math.ceil(characters.length / cols);
  const width = cols * tileSize;
  const height = rows * tileSize;
  const data = new Uint8Array(width * height);

  const glyphIndex = new Map<string, number>();
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    if (tile.width === 0 || tile.height === 0) {
      glyphIndex.set(characters[i], i);
      continue;
    }
    const col = i % cols;
    const row = Math.floor(i / cols);
    const offsetX = Math.floor(tileSize / 2 - SDF_BUFFER - tile.glyphWidth / 2);
    const offsetY = Math.floor(baselineYInTile - SDF_BUFFER - tile.glyphTop);
    const dx = col * tileSize + offsetX;
    const dy = row * tileSize + offsetY;
    for (let y = 0; y < tile.height; y++) {
      const dstY = dy + y;
      if (dstY < row * tileSize || dstY >= (row + 1) * tileSize) continue;
      const srcOffset = y * tile.width;
      const dstOffset = dstY * width + dx;
      for (let x = 0; x < tile.width; x++) {
        const dstX = dx + x;
        if (dstX < col * tileSize || dstX >= (col + 1) * tileSize) continue;
        data[dstOffset + x] = tile.data[srcOffset + x];
      }
    }
    glyphIndex.set(characters[i], i);
  }

  return {
    data,
    width,
    height,
    cols,
    rows,
    tileSize,
    fontSize: SDF_FONT_SIZE,
    glyphIndex,
  };
};

export const SDF_PARAMS = {
  fontSize: SDF_FONT_SIZE,
  buffer: SDF_BUFFER,
  radius: SDF_RADIUS,
};
