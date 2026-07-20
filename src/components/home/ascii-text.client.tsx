"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import styles from "./ascii-text.module.css";

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float uEnableWaves;

void main() {
  vUv = uv;
  float phase = uTime * 1.35;
  vec3 transformed = position;
  transformed.x += sin(phase + position.y * 0.85) * 0.12 * uEnableWaves;
  transformed.y += cos(phase * 0.8 + position.x * 0.35) * 0.045 * uEnableWaves;
  transformed.z += sin(phase * 0.9 + position.x * 0.45) * 0.18 * uEnableWaves;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
  float channelOffset = 0.0018 + sin(uTime * 0.7) * 0.0005;
  float r = texture2D(uTexture, vUv + vec2(channelOffset, 0.0)).r;
  float g = texture2D(uTexture, vUv).g;
  float b = texture2D(uTexture, vUv - vec2(channelOffset, 0.0)).b;
  float a = texture2D(uTexture, vUv).a;
  gl_FragColor = vec4(r, g, b, a);
}
`;

const ASCII_CHARSET = " .,:;i1tfLCG08@";
const ASCII_FONT_STACK = '"SFMono-Regular", Menlo, Consolas, "Liberation Mono", "Courier New", monospace';

function mapRange(value: number, start: number, stop: number, targetStart: number, targetStop: number) {
  return ((value - start) / (stop - start)) * (targetStop - targetStart) + targetStart;
}

class AsciiFilter {
  readonly domElement: HTMLDivElement;
  readonly pre: HTMLPreElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly fontSize: number,
  ) {
    this.domElement = document.createElement("div");
    this.domElement.className = styles.asciiTextOutput;

    this.pre = document.createElement("pre");
    this.pre.className = styles.asciiTextPre;
    this.domElement.appendChild(this.pre);

    this.canvas = document.createElement("canvas");
    this.canvas.className = styles.asciiTextCanvas;
    const context = this.canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("ASCII canvas context is unavailable");
    }
    this.context = context;
    this.context.imageSmoothingEnabled = false;
    this.domElement.appendChild(this.canvas);
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height, false);

    this.context.font = `600 ${this.fontSize}px ${ASCII_FONT_STACK}`;
    const charWidth = Math.max(this.context.measureText("M").width, 1);
    this.canvas.width = Math.max(1, Math.ceil(width / charWidth));
    this.canvas.height = Math.max(1, Math.ceil(height / this.fontSize));
    this.pre.style.fontSize = `${this.fontSize}px`;
  }

  render(scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer.render(scene, camera);

    const width = this.canvas.width;
    const height = this.canvas.height;
    if (!width || !height || !this.width || !this.height) return;

    this.context.clearRect(0, 0, width, height);
    this.context.drawImage(this.renderer.domElement, 0, 0, width, height);
    const pixels = this.context.getImageData(0, 0, width, height).data;
    let output = "";

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (x + y * width) * 4;
        const alpha = pixels[index + 3];
        if (alpha === 0) {
          output += " ";
          continue;
        }

        const gray = (0.3 * pixels[index] + 0.6 * pixels[index + 1] + 0.1 * pixels[index + 2]) / 255;
        const characterIndex = Math.min(
          ASCII_CHARSET.length - 1,
          Math.floor(gray * (ASCII_CHARSET.length - 1)),
        );
        output += ASCII_CHARSET[characterIndex];
      }
      output += "\n";
    }

    this.pre.textContent = output;
  }

  dispose() {
    this.pre.textContent = "";
  }
}

class CanvasText {
  readonly canvas = document.createElement("canvas");
  private readonly context: CanvasRenderingContext2D;

  constructor(
    private readonly text: string,
    private readonly fontSize: number,
    private readonly fontFamily: string,
    private readonly color: string,
  ) {
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Text canvas context is unavailable");
    }
    this.context = context;
    this.resize();
    this.render();
  }

  private get font() {
    return `900 ${this.fontSize}px ${this.fontFamily}`;
  }

  private resize() {
    this.context.font = this.font;
    const metrics = this.context.measureText(this.text);
    this.canvas.width = Math.ceil(metrics.width) + 24;
    this.canvas.height = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + 24;
  }

  private render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.color;
    this.context.font = this.font;
    const metrics = this.context.measureText(this.text);
    this.context.fillText(this.text, 12, 12 + metrics.actualBoundingBoxAscent);
  }
}

type CanvAsciiOptions = {
  text: string;
  asciiFontSize: number;
  textFontSize: number;
  textColor: string;
  planeBaseHeight: number;
  enableWaves: boolean;
};

class CanvAscii {
  private readonly camera: THREE.PerspectiveCamera;
  private readonly scene = new THREE.Scene();
  private readonly renderer: THREE.WebGLRenderer;
  private readonly filter: AsciiFilter;
  private readonly texture: THREE.CanvasTexture;
  private readonly geometry: THREE.PlaneGeometry;
  private readonly material: THREE.ShaderMaterial;
  private readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private width: number;
  private height: number;
  private pointer: { x: number; y: number };
  private animationFrameId: number | null = null;
  private active = false;
  private disposed = false;

  constructor(
    private readonly options: CanvAsciiOptions,
    private readonly container: HTMLDivElement,
    width: number,
    height: number,
  ) {
    this.width = width;
    this.height = height;
    this.pointer = { x: width / 2, y: height / 2 };
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    this.camera.position.z = 30;

    const headingFont = getComputedStyle(container).fontFamily || "Arial, sans-serif";
    const textCanvas = new CanvasText(options.text, options.textFontSize, headingFont, options.textColor);
    this.texture = new THREE.CanvasTexture(textCanvas.canvas);
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.magFilter = THREE.NearestFilter;

    const textAspect = textCanvas.canvas.width / textCanvas.canvas.height;
    this.geometry = new THREE.PlaneGeometry(options.planeBaseHeight * textAspect, options.planeBaseHeight, 36, 36);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: this.texture },
        uEnableWaves: { value: options.enableWaves ? 1 : 0 },
      },
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);
    this.filter = new AsciiFilter(this.renderer, options.asciiFontSize);
    this.container.appendChild(this.filter.domElement);
    this.container.addEventListener("pointermove", this.handlePointerMove);
    this.container.addEventListener("pointerleave", this.handlePointerLeave);
    this.setSize(width, height);
  }

  setSize(width: number, height: number) {
    if (this.disposed || width <= 0 || height <= 0) return;
    this.width = width;
    this.height = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.filter.setSize(width, height);
  }

  setActive(active: boolean) {
    if (this.disposed || this.active === active) return;
    this.active = active;
    if (active) {
      this.animate();
      return;
    }
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private readonly handlePointerMove = (event: PointerEvent) => {
    const bounds = this.container.getBoundingClientRect();
    this.pointer = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
  };

  private readonly handlePointerLeave = () => {
    this.pointer = { x: this.width / 2, y: this.height / 2 };
  };

  private animate() {
    if (!this.active || this.disposed || this.animationFrameId !== null) return;

    const renderFrame = (time: number) => {
      if (!this.active || this.disposed) {
        this.animationFrameId = null;
        return;
      }
      this.render(time * 0.001);
      this.animationFrameId = requestAnimationFrame(renderFrame);
    };

    this.animationFrameId = requestAnimationFrame(renderFrame);
  }

  private render(time: number) {
    this.material.uniforms.uTime.value = time;
    const targetRotationX = mapRange(this.pointer.y, 0, this.height, 0.12, -0.12);
    const targetRotationY = mapRange(this.pointer.x, 0, this.width, -0.14, 0.14);
    this.mesh.rotation.x += (targetRotationX - this.mesh.rotation.x) * 0.045;
    this.mesh.rotation.y += (targetRotationY - this.mesh.rotation.y) * 0.045;
    this.filter.render(this.scene, this.camera);
  }

  dispose() {
    if (this.disposed) return;
    this.setActive(false);
    this.disposed = true;
    this.container.removeEventListener("pointermove", this.handlePointerMove);
    this.container.removeEventListener("pointerleave", this.handlePointerLeave);
    this.filter.dispose();
    this.filter.domElement.remove();
    this.scene.remove(this.mesh);
    this.texture.dispose();
    this.material.dispose();
    this.geometry.dispose();
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}

export type ASCIITextProps = {
  text?: string;
  asciiFontSize?: number;
  textFontSize?: number;
  textColor?: string;
  planeBaseHeight?: number;
  enableWaves?: boolean;
};

export default function ASCIIText({
  text = "ENHE AI",
  asciiFontSize = 8,
  textFontSize = 220,
  textColor = "#ffffff",
  planeBaseHeight = 8,
  enableWaves = true,
}: ASCIITextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let instance: CanvAscii | null = null;
    let initialization: Promise<void> | null = null;
    let isVisible = true;

    const initialize = (width: number, height: number) => {
      if (instance || initialization || width <= 0 || height <= 0) return;

      initialization = Promise.resolve()
        .then(() => document.fonts.ready)
        .then(() => {
          const candidate = new CanvAscii(
            { text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves },
            container,
            width,
            height,
          );
          if (cancelled) {
            candidate.dispose();
            return;
          }
          instance = candidate;
          instance.setActive(isVisible);
          setIsReady(true);
        })
        .catch(() => {
          if (!cancelled) setIsReady(false);
        });
    };

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (instance) {
        instance.setSize(width, height);
      } else {
        initialize(width, height);
      }
    });

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        isVisible = entry.isIntersecting;
        instance?.setActive(isVisible);
      },
      { threshold: 0.05 },
    );

    resizeObserver.observe(container);
    visibilityObserver.observe(container);
    const bounds = container.getBoundingClientRect();
    initialize(bounds.width, bounds.height);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      instance?.dispose();
      instance = null;
    };
  }, [text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves]);

  return (
    <div
      ref={containerRef}
      className={styles.asciiTextContainer}
      data-ready={isReady ? "true" : "false"}
      aria-hidden="true"
    >
      <span className={styles.staticWordmark}>{text}</span>
    </div>
  );
}
