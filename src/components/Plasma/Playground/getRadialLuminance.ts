type Args = {
  width: number;
  height: number;
  cellAspect: number;
};

export const getRadialLuminance = ({
  width,
  height,
  cellAspect,
}: Args): Uint8Array => {
  const cx = (width - 1) / 2;
  const cy = (height - 1) / 2;
  const xExtent = cx * cellAspect;
  const maxDist = Math.hypot(xExtent, cy) || 1;
  const luminance = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const dy = y - cy;
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      const dx = (x - cx) * cellAspect;
      const dist = Math.hypot(dx, dy) / maxDist;
      const clamped = dist > 1 ? 1 : dist < 0 ? 0 : dist;
      luminance[rowOffset + x] = Math.round(clamped * 255);
    }
  }
  return luminance;
};
