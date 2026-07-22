"use client";

import { Color, Mesh, Program, RenderTarget, Renderer, Triangle } from "ogl";
import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./strands.module.css";

const MAX_STRANDS = 12;
const MAX_COLORS = 8;
const FRAME_INTERVAL_MS = 1000 / 60;

const VERTEX_SHADER = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const STRANDS_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[${MAX_COLORS}];
uniform int uColorCount;
uniform int uStrandCount;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaviness;
uniform float uThickness;
uniform float uGlow;
uniform float uTaper;
uniform float uSpread;
uniform float uHueShift;
uniform float uIntensity;
uniform float uOpacity;
uniform float uScale;
uniform float uSaturation;

out vec4 fragColor;

const float PI = 3.14159265;

vec3 spectrum(float t) {
  return 0.5 + 0.5 * cos(2.0 * PI * (t + vec3(0.00, 0.33, 0.67)));
}

vec3 samplePalette(float t) {
  t = fract(t);
  float scaled = t * float(uColorCount);
  int idx = int(floor(scaled));
  float blend = fract(scaled);
  int nextIdx = idx + 1;
  if (nextIdx >= uColorCount) nextIdx = 0;
  return mix(uColors[idx], uColors[nextIdx], blend);
}

vec3 strandColor(float t) {
  if (uColorCount > 0) return samplePalette(t);
  return spectrum(t);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  uv /= max(uScale, 0.0001);

  float energy = 0.06 + uIntensity * 0.94;
  float envelope = pow(max(cos(uv.x * PI * 1.3), 0.0), uTaper);
  vec3 color = vec3(0.0);

  for (int i = 0; i < ${MAX_STRANDS}; i++) {
    if (i >= uStrandCount) break;

    float strand = float(i);
    float phase = strand * 1.7 * uSpread;
    float frequency = (2.0 + strand * 0.35) * uWaviness;
    float strandSpeed = 1.4 + strand * 1.2;
    float time = uTime * uSpeed;
    float wave = sin(uv.x * frequency + time * strandSpeed + phase) * 0.60
      + sin(uv.x * frequency * 1.1 - time * strandSpeed * 0.7 + phase * 1.7) * 0.40;
    float amplitude = (0.1 + 0.02 * energy) * envelope * uAmplitude;
    float distanceToStrand = abs(uv.y - wave * amplitude);
    float strandThickness =
      (0.001 + 0.05 * energy) * (0.35 + envelope) * uThickness;
    float glow = strandThickness / (distanceToStrand + strandThickness * 0.45);
    glow *= glow;

    float hue =
      strand / float(uStrandCount) + uv.x * 0.30 + uTime * 0.04 + uHueShift;
    color += strandColor(hue) * glow * envelope;
  }

  color *= 0.45 + 0.7 * energy;
  color = 1.0 - exp(-color * uGlow);

  float gray = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = max(mix(vec3(gray), color, uSaturation), 0.0);

  float luminance = max(max(color.r, color.g), color.b);
  float alpha = clamp(luminance, 0.0, 1.0) * uOpacity;
  fragColor = vec4(color * uOpacity, alpha);
}
`;

const GLASS_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uScene;
uniform vec2 uResolution;
uniform float uRadius;
uniform float uRefraction;
uniform float uDispersion;

out vec4 fragColor;

vec2 toUv(vec2 point) {
  return point * (uResolution.y / uResolution) + 0.5;
}

void main() {
  vec2 point = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  float distanceFromCenter = length(point);
  float radius = uRadius;
  float edge = fwidth(distanceFromCenter) * 1.5;
  float mask = 1.0 - smoothstep(
    radius - edge,
    radius + edge,
    distanceFromCenter
  );

  if (mask <= 0.0) {
    fragColor = vec4(0.0);
    return;
  }

  float height = sqrt(max(radius * radius - distanceFromCenter * distanceFromCenter, 0.0)) / radius;
  float normalizedDistance = distanceFromCenter / radius;
  vec2 direction = distanceFromCenter > 0.0 ? point / distanceFromCenter : vec2(0.0);
  float lens = smoothstep(0.85, 1.0, normalizedDistance) * pow(normalizedDistance, 6.0);
  vec2 offset = -direction * lens * uRefraction * 0.15;
  vec2 dispersion = -direction * lens * uDispersion * 0.012;

  vec3 light;
  light.r = texture(uScene, toUv(point + offset - dispersion)).r;
  light.g = texture(uScene, toUv(point + offset)).g;
  light.b = texture(uScene, toUv(point + offset + dispersion)).b;

  float fresnel = pow(1.0 - height, 3.0);
  vec3 rim = vec3(1.0) * fresnel * 0.18;
  vec2 lightDirection = normalize(vec2(-0.55, 0.6));
  float specular = pow(max(dot(point / max(radius, 0.0001), lightDirection), 0.0), 6.0);
  specular *= smoothstep(radius, radius * 0.55, distanceFromCenter);

  vec3 emissive = light + rim + vec3(specular) * 0.4;
  float emissiveAlpha = clamp(max(max(emissive.r, emissive.g), emissive.b), 0.0, 1.0);
  float bodyAlpha = 0.05 + fresnel * 0.05;
  float outputAlpha = emissiveAlpha + bodyAlpha * (1.0 - emissiveAlpha);

  fragColor = vec4(emissive * mask, outputAlpha * mask);
}
`;

export interface StrandsProps {
  colors?: string[];
  count?: number;
  speed?: number;
  amplitude?: number;
  waviness?: number;
  thickness?: number;
  glow?: number;
  taper?: number;
  spread?: number;
  hueShift?: number;
  intensity?: number;
  saturation?: number;
  opacity?: number;
  scale?: number;
  glass?: boolean;
  refraction?: number;
  dispersion?: number;
  glassSize?: number;
  className?: string;
  style?: CSSProperties;
}

type RequiredStrandsProps = Required<Omit<StrandsProps, "className" | "style">>;

function buildPalette(colors: string[]): number[][] {
  const filled = colors.length ? colors : ["#ffffff"];

  return Array.from({ length: MAX_COLORS }, (_, index) => {
    const color = new Color(filled[index] ?? filled[filled.length - 1]);
    return [color.r, color.g, color.b];
  });
}

export default function Strands({
  colors = ["#56bfd0", "#41c5db", "#20bbd6", "#d8f9fb"],
  count = 3,
  speed = 0.38,
  amplitude = 0.85,
  waviness = 0.9,
  thickness = 0.56,
  glow = 2.2,
  taper = 3.4,
  spread = 0.92,
  hueShift = 0,
  intensity = 0.48,
  saturation = 1.25,
  opacity = 0.82,
  scale = 1.35,
  glass = false,
  refraction = 1,
  dispersion = 1,
  glassSize = 1,
  className = "",
  style,
}: StrandsProps) {
  const propsRef = useRef<RequiredStrandsProps>({
    colors,
    count,
    speed,
    amplitude,
    waviness,
    thickness,
    glow,
    taper,
    spread,
    hueShift,
    intensity,
    saturation,
    opacity,
    scale,
    glass,
    refraction,
    dispersion,
    glassSize,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  propsRef.current = {
    colors,
    count,
    speed,
    amplitude,
    waviness,
    thickness,
    glow,
    taper,
    spread,
    hueShift,
    intensity,
    saturation,
    opacity,
    scale,
    glass,
    refraction,
    dispersion,
    glassSize,
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    let renderer: Renderer;

    try {
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        antialias: !coarsePointer,
        dpr: Math.min(window.devicePixelRatio || 1, coarsePointer ? 1.25 : 1.5),
      });
    } catch {
      container.dataset.webglUnavailable = "true";
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.backgroundColor = "transparent";
    gl.canvas.setAttribute("aria-hidden", "true");
    gl.canvas.setAttribute("tabindex", "-1");

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    const current = propsRef.current;
    const strandsProgram = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: STRANDS_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [1, 1] },
        uColors: { value: buildPalette(current.colors) },
        uColorCount: { value: Math.min(current.colors.length, MAX_COLORS) },
        uStrandCount: { value: Math.min(current.count, MAX_STRANDS) },
        uSpeed: { value: current.speed },
        uAmplitude: { value: current.amplitude },
        uWaviness: { value: current.waviness },
        uThickness: { value: current.thickness },
        uGlow: { value: current.glow },
        uTaper: { value: current.taper },
        uSpread: { value: current.spread },
        uHueShift: { value: current.hueShift },
        uIntensity: { value: current.intensity },
        uOpacity: { value: current.opacity },
        uScale: { value: current.scale },
        uSaturation: { value: current.saturation },
      },
    });
    const strandsMesh = new Mesh(gl, { geometry, program: strandsProgram });
    const renderTarget = new RenderTarget(gl, { width: 1, height: 1 });
    const glassProgram = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: GLASS_FRAGMENT_SHADER,
      uniforms: {
        uScene: { value: renderTarget.texture },
        uResolution: { value: [1, 1] },
        uRadius: { value: 0.46 * current.glassSize },
        uRefraction: { value: current.refraction },
        uDispersion: { value: current.dispersion },
      },
    });
    const glassMesh = new Mesh(gl, { geometry, program: glassProgram });

    container.appendChild(gl.canvas);

    let frameId = 0;
    let visible = true;
    let previousFrame = performance.now();
    let elapsed = 0;
    let paletteKey = current.colors.join("|");

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height);
      const resolution = [gl.canvas.width, gl.canvas.height];
      strandsProgram.uniforms.uResolution.value = resolution;
      renderTarget.setSize(gl.canvas.width, gl.canvas.height);
      glassProgram.uniforms.uResolution.value = resolution;
    };

    const render = (time: number) => {
      frameId = 0;
      if (!visible) return;

      const delta = time - previousFrame;
      if (delta < FRAME_INTERVAL_MS - 1) {
        frameId = window.requestAnimationFrame(render);
        return;
      }

      previousFrame = time - (delta % FRAME_INTERVAL_MS);
      elapsed += Math.min(delta, 100);
      const next = propsRef.current;
      const nextPaletteKey = next.colors.join("|");

      if (nextPaletteKey !== paletteKey) {
        paletteKey = nextPaletteKey;
        strandsProgram.uniforms.uColors.value = buildPalette(next.colors);
      }

      strandsProgram.uniforms.uTime.value = elapsed * 0.001;
      strandsProgram.uniforms.uColorCount.value = Math.min(next.colors.length, MAX_COLORS);
      strandsProgram.uniforms.uStrandCount.value = Math.min(
        Math.max(Math.round(next.count), 1),
        MAX_STRANDS,
      );
      strandsProgram.uniforms.uSpeed.value = next.speed;
      strandsProgram.uniforms.uAmplitude.value = next.amplitude;
      strandsProgram.uniforms.uWaviness.value = next.waviness;
      strandsProgram.uniforms.uThickness.value = next.thickness;
      strandsProgram.uniforms.uGlow.value = next.glow;
      strandsProgram.uniforms.uTaper.value = next.taper;
      strandsProgram.uniforms.uSpread.value = next.spread;
      strandsProgram.uniforms.uHueShift.value = next.hueShift;
      strandsProgram.uniforms.uIntensity.value = next.intensity;
      strandsProgram.uniforms.uOpacity.value = next.opacity;
      strandsProgram.uniforms.uScale.value = next.scale;
      strandsProgram.uniforms.uSaturation.value = next.saturation;

      if (next.glass) {
        renderer.render({ scene: strandsMesh, target: renderTarget });
        glassProgram.uniforms.uScene.value = renderTarget.texture;
        glassProgram.uniforms.uRefraction.value = next.refraction;
        glassProgram.uniforms.uDispersion.value = next.dispersion;
        glassProgram.uniforms.uRadius.value = 0.46 * next.glassSize;
        renderer.render({ scene: glassMesh });
      } else {
        renderer.render({ scene: strandsMesh });
      }

      frameId = window.requestAnimationFrame(render);
    };

    const start = () => {
      if (!frameId && visible) {
        previousFrame = performance.now();
        frameId = window.requestAnimationFrame(render);
      }
    };

    const stop = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { rootMargin: "80px" },
    );
    intersectionObserver.observe(container);
    resize();
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  const classNames = [styles.root, className].filter(Boolean).join(" ");
  return <div ref={containerRef} className={classNames} style={style} />;
}
