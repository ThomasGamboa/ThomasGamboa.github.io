import '../styles/main.css';
import type { Experience } from '../experience/Experience.ts';
import { LoadingScreen } from '../loading/LoadingScreen.ts';
import { startInterface } from '../ui/interface.ts';

const root = document.documentElement;
const canvas = document.querySelector<HTMLCanvasElement>('[data-experience-canvas]');
const parameters = new URLSearchParams(window.location.search);
const playsIntro =
  canvas !== null && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (playsIntro) {
  root.dataset.intro = 'pending';
}

startInterface();

const loadingScreen = LoadingScreen.attach(document);

async function launchExperience(target: HTMLCanvasElement): Promise<Experience> {
  const report = (progress: number) => loadingScreen?.setProgress(progress);
  report(0.05);
  const [{ Experience }, { parseTier }, { scaleProgress }] = await Promise.all([
    import('../experience/Experience.ts'),
    import('../experience/core/quality.ts'),
    import('../experience/core/progress.ts'),
  ]);
  report(0.15);
  const experience = await Experience.create({
    canvas: target,
    onProgress: scaleProgress(report, 0.15, 0.95),
    tierOverride: parseTier(parameters.get('quality')),
    intro: playsIntro,
  });
  experience.start();

  if (import.meta.env.DEV && parameters.has('debug')) {
    const { mountDebugPanel } = await import('../experience/debug/DebugPanel.ts');
    mountDebugPanel(experience);
  }
  return experience;
}

function settleIntro(state: 'reveal' | 'done'): void {
  if (root.dataset.intro) {
    root.dataset.intro = state;
  }
}

function markWebglUnavailable(error: unknown): void {
  document.documentElement.dataset.webgl = 'unavailable';
  console.error(error);
}

if (canvas) {
  launchExperience(canvas)
    .then(async (experience) => {
      await loadingScreen?.complete();
      experience.playIntro({
        onReveal: () => settleIntro('reveal'),
        onComplete: () => settleIntro('done'),
      });
    })
    .catch(async (error: unknown) => {
      markWebglUnavailable(error);
      await loadingScreen?.complete();
      settleIntro('done');
    });
} else {
  loadingScreen?.complete();
}
