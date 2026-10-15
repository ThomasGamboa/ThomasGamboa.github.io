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
  TorusGeometry,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from 'three';
import { palette } from '../../../../shared/design/palette.ts';
import { createSkyMaterial, createSkyUniforms } from './Sky.ts';

interface Panel {
  readonly width: number;
  readonly height: number;
  readonly color: Color;
  readonly position: readonly [number, number, number];
}

const signal = new Color(palette.signal);

const panels: readonly Panel[] = [
  {
    width: 18,
    height: 3,
    color: new Color(2.4, 2.3, 2.2),
    position: [0, 14, -6],
  },
  {
    width: 2,
    height: 16,
    color: signal.clone().multiplyScalar(2.6),
    position: [-14, 2, 2],
  },
  {
    width: 2,
    height: 16,
    color: new Color(0.6, 0.75, 1.6),
    position: [14, 2, -4],
  },
];

export function createEnvironmentMap(
  renderer: WebGLRenderer,
  skyMap: Texture | null,
): WebGLRenderTarget {
  const scene = new Scene();
  const disposables: { dispose(): void }[] = [];

  const skyGeometry = new SphereGeometry(40, 32, 16);
  const skyMaterial = createSkyMaterial(createSkyUniforms(skyMap));
  scene.add(new Mesh(skyGeometry, skyMaterial));
  disposables.push(skyGeometry, skyMaterial);

  for (const panel of panels) {
    const geometry = new PlaneGeometry(panel.width, panel.height);
    const material = new MeshBasicMaterial({ color: panel.color, side: DoubleSide });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(...panel.position);
    mesh.lookAt(0, 0, 0);
    scene.add(mesh);
    disposables.push(geometry, material);
  }

  const ringGeometry = new TorusGeometry(22, 0.35, 8, 96);
  const ringMaterial = new MeshBasicMaterial({ color: signal.clone().multiplyScalar(1.2) });
  const ring = new Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -1.5;
  scene.add(ring);
  disposables.push(ringGeometry, ringMaterial);

  const generator = new PMREMGenerator(renderer);
  const target = generator.fromScene(scene, 0.02, 0.1, 100);
  generator.dispose();
  for (const item of disposables) {
    item.dispose();
  }
  return target;
}
