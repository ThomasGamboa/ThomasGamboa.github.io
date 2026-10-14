import { PerspectiveCamera, Scene } from 'three';
import { Renderer } from './core/Renderer.ts';
import { type FrameState, Ticker } from './core/Ticker.ts';
import { Viewport, type ViewportState } from './core/Viewport.ts';
import { Cube } from './world/cube/Cube.ts';
import type { WorldModule } from './world/WorldModule.ts';

const maximumPixelRatio = 2;

export class Experience {
  readonly scene = new Scene();
  readonly camera: PerspectiveCamera;
  readonly viewport: Viewport;
  readonly renderer: Renderer;
  readonly ticker = new Ticker();
  readonly #modules: WorldModule[];
  readonly #releaseViewport: () => void;
  readonly #releaseTicker: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.viewport = new Viewport(canvas, maximumPixelRatio);
    this.renderer = new Renderer(canvas, this.viewport.state);
    this.camera = new PerspectiveCamera(40, this.viewport.state.aspect, 0.1, 200);
    this.camera.position.set(0, 0, 4.5);

    this.#modules = [new Cube()];
    for (const module of this.#modules) {
      this.scene.add(module.object);
    }

    this.#releaseViewport = this.viewport.onChange(this.#onResize);
    this.#releaseTicker = this.ticker.add(this.#onFrame);
  }

  start(): void {
    this.renderer.render(this.scene, this.camera);
    this.ticker.start();
  }

  dispose(): void {
    this.ticker.stop();
    this.#releaseTicker();
    this.#releaseViewport();
    this.viewport.dispose();
    for (const module of this.#modules) {
      this.scene.remove(module.object);
      module.dispose();
    }
    this.renderer.dispose();
  }

  readonly #onResize = (state: ViewportState): void => {
    this.camera.aspect = state.aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.resize(state);
  };

  readonly #onFrame = (frame: FrameState): void => {
    for (const module of this.#modules) {
      module.update(frame);
    }
    this.renderer.render(this.scene, this.camera);
  };
}
