import { NoToneMapping, SRGBColorSpace, WebGLRenderer } from 'three';
import { palette } from '../../../shared/design/palette.ts';
import type { DeviceSignals } from './quality.ts';
import type { ViewportState } from './Viewport.ts';

interface NavigatorWithHints extends Navigator {
  readonly deviceMemory?: number;
  readonly connection?: { readonly saveData?: boolean };
}

export class Renderer {
  readonly instance: WebGLRenderer;

  constructor(canvas: HTMLCanvasElement) {
    this.instance = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });
    this.instance.outputColorSpace = SRGBColorSpace;
    this.instance.toneMapping = NoToneMapping;
    this.instance.setClearColor(palette.void, 1);
  }

  readDeviceSignals(): DeviceSignals {
    const hints = navigator as NavigatorWithHints;
    return {
      coarsePointer: window.matchMedia('(pointer: coarse)').matches,
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
      deviceMemory: hints.deviceMemory ?? null,
      maxTextureSize: this.instance.capabilities.maxTextureSize,
      saveData: hints.connection?.saveData ?? false,
    };
  }

  resize({ width, height, pixelRatio }: ViewportState): void {
    this.instance.setPixelRatio(pixelRatio);
    this.instance.setSize(width, height, false);
  }

  dispose(): void {
    this.instance.dispose();
  }
}
