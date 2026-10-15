import {
  BackSide,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  type Texture,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from 'three';
import filmFragment from '../../shaders/film.frag.glsl?raw';
import filmVertex from '../../shaders/film.vert.glsl?raw';
import noise from '../../shaders/noise.glsl?raw';
import { createSkyMaterial, createSkyUniforms } from './Sky.ts';

interface Panel {
  readonly width: number;
  readonly height: number;
  readonly color: Color;
  readonly position: readonly [number, number, number];
}

interface Disposable {
  dispose(): void;
}

const panels: readonly Panel[] = [
  { width: 16, height: 10, color: new Color(1.7, 1.68, 1.75), position: [-7, 13, 8] },
  { width: 2.6, height: 20, color: new Color(0.15, 1.5, 2.1), position: [15, 1, 3] },
  { width: 2.6, height: 20, color: new Color(2.1, 0.22, 1.2), position: [-15, 0, -4] },
  { width: 22, height: 2.2, color: new Color(1, 1.5, 0.25), position: [0, -9, -10] },
  { width: 9, height: 9, color: new Color(0.55, 0.32, 1.6), position: [6, 5, -15] },
];

function addPanels(scene: Scene, disposables: Disposable[], intensity: number): void {
  for (const panel of panels) {
    const geometry = new PlaneGeometry(panel.width, panel.height);
    const material = new MeshBasicMaterial({
      color: panel.color.clone().multiplyScalar(intensity),
      side: DoubleSide,
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(...panel.position);
    mesh.lookAt(0, 0, 0);
    scene.add(mesh);
    disposables.push(geometry, material);
  }
}

function bake(renderer: WebGLRenderer, scene: Scene, disposables: Disposable[]): WebGLRenderTarget {
  const generator = new PMREMGenerator(renderer);
  const target = generator.fromScene(scene, 0.015, 0.1, 100);
  generator.dispose();
  for (const item of disposables) {
    item.dispose();
  }
  return target;
}

export function createEnvironmentMap(
  renderer: WebGLRenderer,
  skyMap: Texture | null,
): WebGLRenderTarget {
  const scene = new Scene();
  const disposables: Disposable[] = [];

  if (skyMap) {
    const skyGeometry = new SphereGeometry(40, 32, 16);
    const skyMaterial = createSkyMaterial(createSkyUniforms(skyMap));
    scene.add(new Mesh(skyGeometry, skyMaterial));
    disposables.push(skyGeometry, skyMaterial);
  }

  addPanels(scene, disposables, 1);
  return bake(renderer, scene, disposables);
}

export function createFilmMap(renderer: WebGLRenderer): WebGLRenderTarget {
  const scene = new Scene();
  const geometry = new SphereGeometry(40, 128, 64);
  const material = new ShaderMaterial({
    vertexShader: filmVertex,
    fragmentShader: `${noise}\n${filmFragment}`,
    side: BackSide,
    depthWrite: false,
  });
  scene.add(new Mesh(geometry, material));
  const disposables: Disposable[] = [geometry, material];
  addPanels(scene, disposables, 0.8);
  return bake(renderer, scene, disposables);
}
