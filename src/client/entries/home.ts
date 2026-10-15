import '../styles/main.css';
import { LoadingScreen } from '../loading/LoadingScreen.ts';
import { startInterface } from '../ui/interface.ts';

startInterface();

const loadingScreen = LoadingScreen.attach(document);
const canvas = document.querySelector<HTMLCanvasElement>('[data-experience-canvas]');
const parameters = new URLSearchParams(window.location.search);

async function launchExperience(target: HTMLCanvasElement): Promise<void> {
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
  });
  experience.start();

  if (import.meta.env.DEV && parameters.has('debug')) {
    const { mountDebugPanel } = await import('../experience/debug/DebugPanel.ts');
    mountDebugPanel(experience);
  }
}

function markWebglUnavailable(error: unknown): void {
  document.documentElement.dataset.webgl = 'unavailable';
  console.error(error);
}

if (canvas) {
  launchExperience(canvas)
    .catch(markWebglUnavailable)
    .finally(() => loadingScreen?.complete());
} else {
  loadingScreen?.complete();
}
