import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SphereGeometry,
  type Texture,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from 'three';
import { createSkyMaterial, createSkyUniforms } from './Sky.ts';

interface Panel {
  readonly width: number;
  readonly height: number;
  readonly color: Color;
  readonly position: readonly [number, number, number];
}

const panels: readonly Panel[] = [
  { width: 16, height: 10, color: new Color(1.7, 1.68, 1.75), position: [-7, 13, 8] },
  { width: 2.6, height: 20, color: new Color(0.15, 1.5, 2.1), position: [15, 1, 3] },
  { width: 2.6, height: 20, color: new Color(2.1, 0.22, 1.2), position: [-15, 0, -4] },
  { width: 22, height: 2.2, color: new Color(1, 1.5, 0.25), position: [0, -9, -10] },
  { width: 9, height: 9, color: new Color(0.55, 0.32, 1.6), position: [6, 5, -15] },
];

export function createEnvironmentMap(
  renderer: WebGLRenderer,
  skyMap: Texture | null,
): WebGLRenderTarget {
  const scene = new Scene();
  const disposables: { dispose(): void }[] = [];

  if (skyMap) {
    const skyGeometry = new SphereGeometry(40, 32, 16);
    const skyMaterial = createSkyMaterial(createSkyUniforms(skyMap));
    scene.add(new Mesh(skyGeometry, skyMaterial));
    disposables.push(skyGeometry, skyMaterial);
  }

  for (const panel of panels) {
    const geometry = new PlaneGeometry(panel.width, panel.height);
    const material = new MeshBasicMaterial({ color: panel.color, side: DoubleSide });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(...panel.position);
    mesh.lookAt(0, 0, 0);
    scene.add(mesh);
    disposables.push(geometry, material);
  }

  const generator = new PMREMGenerator(renderer);
  const target = generator.fromScene(scene, 0.015, 0.1, 100);
  generator.dispose();
  for (const item of disposables) {
    item.dispose();
  }
  return target;
}
