export interface RenderProfile {
  exposure: number;
  bloom: { intensity: number; threshold: number; smoothing: number; radius: number };
  chromaticAberration: { offset: number };
  grain: { opacity: number };
  vignette: { offset: number; darkness: number };
}

export function createRenderProfile(): RenderProfile {
  return {
    exposure: 1,
    bloom: { intensity: 1.15, threshold: 0.42, smoothing: 0.3, radius: 0.78 },
    chromaticAberration: { offset: 0.0011 },
    grain: { opacity: 0.075 },
    vignette: { offset: 0.28, darkness: 0.78 },
  };
}
