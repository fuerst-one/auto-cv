export const VERTEX_SHADER = `#version 300 es
precision highp float;

in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  v_uv.y = 1.0 - v_uv.y;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

#define MAX_RIPPLES 6

in vec2 v_uv;
out vec4 fragColor;

uniform vec2 u_gridSize;
uniform vec2 u_atlasGridSize;
uniform vec2 u_atlasSize;
uniform vec2 u_cellPx;
uniform float u_tileSize;
uniform float u_atlasScale;
uniform float u_rampLength;
uniform int u_sourceMode;
uniform vec3 u_bgColor;

uniform sampler2D u_glyphAtlas;
uniform sampler2D u_rampTex;
uniform sampler2D u_luminanceTex;

uniform vec4 u_angles;
uniform vec4 u_radii;
uniform vec4 u_centerXs;
uniform vec4 u_centerYs;
uniform float u_sineTable[256];
uniform float u_hueShift;
uniform float u_zoomFactor;
uniform float u_xAspectSq;
uniform int u_complexity;

uniform vec2 u_cursor;
uniform float u_cursorActive;
uniform float u_lensRadius;
uniform float u_lensStrength;

uniform vec3 u_ripples[MAX_RIPPLES];
uniform float u_rippleRadius;
uniform float u_rippleStrength;
uniform float u_rippleLifetime;

float computePlasmaValue(vec2 cellPos) {
  float fx = cellPos.x;
  float fy = cellPos.y;
  float value = u_hueShift;
  for (int i = 0; i < 4; i++) {
    if (i >= u_complexity) break;
    float ai = u_angles[i];
    float ri = u_radii[i];
    float cxi = u_centerXs[i];
    float cyi = u_centerYs[i];
    float xi = cos(ai) * ri + cxi - fx;
    float yi = sin(ai) * ri + cyi - fy;
    float fIdx = (xi * xi * u_xAspectSq + yi * yi) * u_zoomFactor;
    int rounded = int(floor(fIdx + 0.5));
    int shifted = rounded / 32;
    int masked = shifted - (shifted / 256) * 256;
    if (masked < 0) masked += 256;
    value += u_sineTable[masked];
  }
  return value;
}

float computeLuminanceValue(ivec2 cellIdx) {
  float lum = texelFetch(u_luminanceTex, cellIdx, 0).r * 255.0;
  float scaled = floor(lum * u_rampLength / 256.0);
  float capped = min(scaled, u_rampLength - 1.0);
  return (u_rampLength - 1.0) - capped;
}

float modPositive(float a, float m) {
  float r = mod(a, m);
  if (r < 0.0) r += m;
  return r;
}

vec2 computeRippleDisplacement(vec2 cellPosBase) {
  vec2 disp = vec2(0.0);
  float invLife = 1.0 / max(u_rippleLifetime, 1e-3);
  float radiusSq = max(u_rippleRadius * u_rippleRadius, 1e-3);
  for (int i = 0; i < MAX_RIPPLES; i++) {
    vec3 r = u_ripples[i];
    float age = r.z;
    if (age < 0.0 || age >= u_rippleLifetime) continue;
    vec2 toR = cellPosBase - r.xy;
    float d2_iso = toR.x * toR.x * u_xAspectSq + toR.y * toR.y;
    float falloff = exp(-d2_iso / radiusSq);
    float t = age * invLife;
    float pulse = 4.0 * t * (1.0 - t);
    disp -= u_rippleStrength * pulse * falloff * toR;
  }
  return disp;
}

void main() {
  vec2 cellCoord = v_uv * u_gridSize;
  ivec2 cellIdx = ivec2(floor(cellCoord));
  vec2 cellLocal = cellCoord - vec2(cellIdx);

  float rampIdx;
  if (u_sourceMode == 0) {
    vec2 cellPosBase = vec2(cellIdx);
    vec2 cellPos = cellPosBase;
    if (u_cursorActive > 0.5) {
      vec2 toCursor = cellPosBase - u_cursor;
      float d2_iso = toCursor.x * toCursor.x * u_xAspectSq + toCursor.y * toCursor.y;
      float lensRadiusSq = max(u_lensRadius * u_lensRadius, 1e-3);
      float falloff = exp(-d2_iso / lensRadiusSq);
      cellPos = cellPosBase - u_lensStrength * falloff * toCursor;
    }
    cellPos += computeRippleDisplacement(cellPosBase);
    float plasmaValue = computePlasmaValue(cellPos);
    rampIdx = modPositive(floor(plasmaValue), u_rampLength);
  } else {
    rampIdx = computeLuminanceValue(cellIdx);
  }

  vec4 rampSample = texelFetch(u_rampTex, ivec2(int(rampIdx), 0), 0);
  vec3 color = rampSample.rgb;
  float atlasIndex = floor(rampSample.a * 255.0 + 0.5);

  float atlasCols = u_atlasGridSize.x;
  float tileX = mod(atlasIndex, atlasCols);
  float tileY = floor(atlasIndex / atlasCols);

  vec2 cellPxOffset = (cellLocal - 0.5) * u_cellPx;
  vec2 atlasPxOffset = cellPxOffset * u_atlasScale;
  vec2 tileOriginPx = vec2(tileX, tileY) * u_tileSize;
  vec2 atlasPosPx = tileOriginPx + 0.5 * u_tileSize + atlasPxOffset;
  vec2 tileMinPx = tileOriginPx + 0.5;
  vec2 tileMaxPx = tileOriginPx + u_tileSize - 0.5;
  atlasPosPx = clamp(atlasPosPx, tileMinPx, tileMaxPx);
  vec2 atlasUv = atlasPosPx / u_atlasSize;

  float sdf = texture(u_glyphAtlas, atlasUv).r;
  float edge = 0.75;
  float aa = 0.25 * fwidth(sdf) + 0.0001;
  float alpha = smoothstep(edge - aa, edge + aa, sdf);

  fragColor = vec4(mix(u_bgColor, color, alpha), 1.0);
}
`;

export const POST_VERTEX_SHADER = `#version 300 es
precision highp float;

in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const POST_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_scene;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_blurMaxPx;
uniform float u_blurInner;
uniform float u_blurOuter;
uniform float u_glitchInterval;
uniform float u_glitchDuration;
uniform float u_glitchBands;
uniform float u_glitchTearPx;

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

const vec2 RING_INNER[4] = vec2[4](
  vec2(1.0, 0.0), vec2(-1.0, 0.0), vec2(0.0, 1.0), vec2(0.0, -1.0)
);
const vec2 RING_OUTER[8] = vec2[8](
  vec2(1.0, 0.0), vec2(-1.0, 0.0), vec2(0.0, 1.0), vec2(0.0, -1.0),
  vec2(0.7071, 0.7071), vec2(-0.7071, 0.7071),
  vec2(0.7071, -0.7071), vec2(-0.7071, -0.7071)
);

void main() {
  vec2 uv = v_uv;
  float edgeDist = length((v_uv - 0.5) * 2.0);
  float vignette = smoothstep(u_blurInner, u_blurOuter, edgeDist);

  // Occasional glitch burst: one short, randomly-placed window per interval.
  float slot = floor(u_time / u_glitchInterval);
  float slotT = u_time - slot * u_glitchInterval;
  float start = hash11(slot) * (u_glitchInterval - u_glitchDuration);
  float local = slotT - start;
  float burst = 0.0;
  if (local >= 0.0 && local < u_glitchDuration) {
    float envelope = sin(3.14159265 * local / u_glitchDuration);
    burst = envelope * (0.35 + 0.65 * hash11(slot * 7.13));
  }

  // Radial blur: zero in the center, ramping up towards the frame edges.
  vec2 texel = 1.0 / u_resolution;
  float radius = u_blurMaxPx * vignette;
  vec3 col = texture(u_scene, uv).rgb * 0.22;
  for (int i = 0; i < 4; i++) {
    col += texture(u_scene, uv + RING_INNER[i] * texel * radius * 0.5).rgb * 0.1;
  }
  for (int i = 0; i < 8; i++) {
    col += texture(u_scene, uv + RING_OUTER[i] * texel * radius).rgb * 0.0475;
  }

  if (burst > 0.0) {
    // Band tear: only some horizontal bands rip apart, red pulled one way
    // and cyan (green + blue) the other, each band with its own random
    // strength and pull direction. Everything outside a torn band stays put.
    float band = floor(v_uv.y * u_glitchBands);
    float bandOn = step(0.55, hash21(vec2(band, slot)));
    float bandAmp = 0.3 + 0.7 * hash21(vec2(band * 3.7, slot + 13.7));
    float bandSign = sign(hash21(vec2(band * 9.1, slot + 41.3)) - 0.5);
    float tear =
      bandOn * bandSign * bandAmp * u_glitchTearPx * texel.x * burst;
    if (tear != 0.0) {
      vec3 redSide = texture(u_scene, uv + vec2(tear, 0.0)).rgb;
      vec3 cyanSide = texture(u_scene, uv - vec2(tear, 0.0)).rgb;
      col = vec3(redSide.r, cyanSide.g, cyanSide.b);
    }
  }

  fragColor = vec4(col, 1.0);
}
`;
