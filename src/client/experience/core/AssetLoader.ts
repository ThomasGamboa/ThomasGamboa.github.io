import {
  EquirectangularReflectionMapping,
  type Group,
  LoadingManager,
  NoColorSpace,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from 'three';
import { type ProgressListener, WeightedProgress } from './progress.ts';

export type AssetKind = 'texture' | 'data-texture' | 'environment' | 'model';

export interface AssetDescriptor {
  readonly id: string;
  readonly kind: AssetKind;
  readonly url: string;
  readonly weight?: number;
}

export interface AssetMap {
  texture: Texture;
  'data-texture': Texture;
  environment: Texture;
  model: Group;
}

type LoadedAsset = AssetMap[AssetKind];

export class AssetRegistry {
  readonly #assets: ReadonlyMap<string, LoadedAsset>;

  constructor(assets: ReadonlyMap<string, LoadedAsset>) {
    this.#assets = assets;
  }

  get<Kind extends AssetKind>(id: string, _kind: Kind): AssetMap[Kind] | undefined {
    return this.#assets.get(id) as AssetMap[Kind] | undefined;
  }

  dispose(): void {
    for (const asset of this.#assets.values()) {
      if ('dispose' in asset && typeof asset.dispose === 'function') {
        asset.dispose();
      }
    }
  }
}

type ByteProgress = (event: ProgressEvent) => void;

async function loadEnvironment(
  url: string,
  manager: LoadingManager,
  onBytes: ByteProgress,
): Promise<Texture> {
  const extension = url.split('?')[0]?.split('.').pop()?.toLowerCase();
  let texture: Texture;
  if (extension === 'hdr') {
    const { HDRLoader } = await import('three/addons/loaders/HDRLoader.js');
    texture = await new HDRLoader(manager).loadAsync(url, onBytes);
  } else if (extension === 'exr') {
    const { EXRLoader } = await import('three/addons/loaders/EXRLoader.js');
    texture = await new EXRLoader(manager).loadAsync(url, onBytes);
  } else {
    texture = await new TextureLoader(manager).loadAsync(url, onBytes);
    texture.colorSpace = SRGBColorSpace;
  }
  texture.mapping = EquirectangularReflectionMapping;
  return texture;
}

async function loadModel(
  url: string,
  manager: LoadingManager,
  onBytes: ByteProgress,
): Promise<Group> {
  const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
    import('three/addons/loaders/GLTFLoader.js'),
    import('three/addons/libs/meshopt_decoder.module.js'),
  ]);
  const loader = new GLTFLoader(manager);
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url, onBytes);
  return gltf.scene;
}

async function loadTexture(
  url: string,
  colorData: boolean,
  manager: LoadingManager,
  onBytes: ByteProgress,
): Promise<Texture> {
  const texture = await new TextureLoader(manager).loadAsync(url, onBytes);
  texture.colorSpace = colorData ? SRGBColorSpace : NoColorSpace;
  return texture;
}

function loadAsset(
  descriptor: AssetDescriptor,
  manager: LoadingManager,
  onBytes: ByteProgress,
): Promise<LoadedAsset> {
  switch (descriptor.kind) {
    case 'texture':
      return loadTexture(descriptor.url, true, manager, onBytes);
    case 'data-texture':
      return loadTexture(descriptor.url, false, manager, onBytes);
    case 'environment':
      return loadEnvironment(descriptor.url, manager, onBytes);
    case 'model':
      return loadModel(descriptor.url, manager, onBytes);
  }
}

export async function loadAssets(
  manifest: readonly AssetDescriptor[],
  onProgress: ProgressListener,
): Promise<AssetRegistry> {
  if (manifest.length === 0) {
    onProgress(1);
    return new AssetRegistry(new Map());
  }

  const progress = new WeightedProgress(
    Object.fromEntries(manifest.map((asset) => [asset.id, asset.weight ?? 1])),
    onProgress,
  );
  const manager = new LoadingManager();
  const entries = await Promise.all(
    manifest.map(async (descriptor) => {
      const asset = await loadAsset(descriptor, manager, (event) => {
        if (event.lengthComputable && event.total > 0) {
          progress.set(descriptor.id, (event.loaded / event.total) * 0.95);
        }
      });
      progress.set(descriptor.id, 1);
      return [descriptor.id, asset] as const;
    }),
  );
  return new AssetRegistry(new Map(entries));
}
