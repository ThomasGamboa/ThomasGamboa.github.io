import {
  ACESFilmicToneMapping,
  type Camera,
  type Object3D,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import { palette } from '../../../shared/design/palette.ts';
import type { ViewportState } from './Viewport.ts';

export class Renderer {
  readonly instance: WebGLRenderer;

  constructor(canvas: HTMLCanvasElement, viewport: ViewportState) {
    this.instance = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.instance.outputColorSpace = SRGBColorSpace;
    this.instance.toneMapping = ACESFilmicToneMapping;
    this.instance.setClearColor(palette.void, 1);
    this.resize(viewport);
  }

  resize({ width, height, pixelRatio }: ViewportState): void {
    this.instance.setPixelRatio(pixelRatio);
    this.instance.setSize(width, height, false);
  }

  render(scene: Object3D, camera: Camera): void {
    this.instance.render(scene, camera);
  }

  dispose(): void {
    this.instance.dispose();
  }
}
