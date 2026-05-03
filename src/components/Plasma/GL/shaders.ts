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
