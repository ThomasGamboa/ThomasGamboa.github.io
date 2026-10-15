import GUI from 'lil-gui';
import { qualityTiers } from '../core/quality.ts';
import type { Experience } from '../Experience.ts';

export function mountDebugPanel(experience: Experience): GUI {
  const gui = new GUI({ title: 'Experience' });
  Object.assign(window, { experience });
  const { profile, post } = experience;
  const apply = () => post.applyProfile(profile);

  const state = { tier: experience.quality.tier, fps: 0 };
  gui
    .add(state, 'tier', [...qualityTiers])
    .name('quality')
    .onChange((tier: (typeof qualityTiers)[number]) => experience.setTier(tier));
  const fps = gui.add(state, 'fps').disable().listen();
  let frames = 0;
  let elapsed = 0;
  experience.ticker.add(({ delta }) => {
    frames += 1;
    elapsed += delta;
    if (elapsed >= 0.5) {
      state.fps = Math.round(frames / elapsed);
      frames = 0;
      elapsed = 0;
      fps.updateDisplay();
    }
  });

  const bloom = gui.addFolder('Bloom');
  bloom.add(profile.bloom, 'intensity', 0, 4, 0.01).onChange(apply);
  bloom.add(profile.bloom, 'threshold', 0, 1, 0.01).onChange(apply);
  bloom.add(profile.bloom, 'smoothing', 0, 1, 0.01).onChange(apply);
  bloom.add(profile.bloom, 'radius', 0, 1, 0.01).onChange(apply);

  const lens = gui.addFolder('Lens');
  lens
    .add(profile.chromaticAberration, 'offset', 0, 0.01, 0.0001)
    .name('aberration')
    .onChange(apply);
  lens.add(profile.grain, 'opacity', 0, 0.5, 0.005).name('grain').onChange(apply);
  lens.add(profile.vignette, 'offset', 0, 1, 0.01).name('vignette offset').onChange(apply);
  lens.add(profile.vignette, 'darkness', 0, 1, 0.01).name('vignette darkness').onChange(apply);

  return gui;
}
