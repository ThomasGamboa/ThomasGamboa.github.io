import {
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  type PerspectiveCamera,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';
import { markHeight, markPath, markWidth } from '../../../../shared/design/brand-mark.ts';
import type { FrameState } from '../../core/Ticker.ts';
import type { IntroState } from '../../timeline/Intro.ts';
import type { WorldModule } from '../WorldModule.ts';
import type { Entity } from './Entity.ts';

const textureHeight = 1024;
const emblemHeight = 0.76;
const glow = 1.5;
const tint = new Color(1, -0.1, -0.072);

function createTexture(): CanvasTexture {
  const scale = textureHeight / markHeight;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(markWidth * scale);
  canvas.height = textureHeight;
  const context = canvas.getContext('2d');
  if (context) {
    context.scale(scale, scale);
    context.fillStyle = '#ffffff';
    context.fill(new Path2D(markPath), 'evenodd');
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export class Emblem implements WorldModule {
  readonly object = new Group();
  readonly #entity: Entity;
  readonly #camera: PerspectiveCamera;
  readonly #intro: IntroState;
  readonly #mesh: Mesh<PlaneGeometry, MeshBasicMaterial>;

  constructor(entity: Entity, camera: PerspectiveCamera, intro: IntroState) {
    this.#entity = entity;
    this.#camera = camera;
    this.#intro = intro;
    const geometry = new PlaneGeometry(emblemHeight * (markWidth / markHeight), emblemHeight);
    const material = new MeshBasicMaterial({
      map: createTexture(),
      color: tint.clone().multiplyScalar(glow),
      alphaTest: 0.5,
      alphaToCoverage: true,
      side: DoubleSide,
    });
    this.#mesh = new Mesh(geometry, material);
    this.#mesh.renderOrder = -1;
    this.object.add(this.#mesh);
    this.object.name = 'emblem';
  }

  update(_frame: FrameState): void {
    const reveal = this.#intro.emblem;
    const presence = this.#entity.glass * Math.min(reveal, 1);
    const visible = presence > 0.02;
    this.#mesh.visible = visible;
    if (!visible) {
      return;
    }
    const eased = presence * presence * (3 - 2 * presence);
    this.#mesh.position.copy(this.#entity.object.position);
    this.#mesh.quaternion.copy(this.#camera.quaternion);
    this.#mesh.scale.setScalar(this.#entity.scale * eased * Math.max(reveal, 1));
    this.#mesh.material.color.copy(tint).multiplyScalar(glow * (1 + this.#intro.flare * 1.4));
  }

  dispose(): void {
    this.#mesh.geometry.dispose();
    this.#mesh.material.map?.dispose();
    this.#mesh.material.dispose();
  }
}
