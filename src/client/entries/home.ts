import '../styles/main.css';
import { LoadingScreen } from '../loading/LoadingScreen.ts';

const loadingScreen = LoadingScreen.attach(document);
const canvas = document.querySelector<HTMLCanvasElement>('[data-experience-canvas]');

async function launchExperience(target: HTMLCanvasElement): Promise<void> {
  loadingScreen?.setProgress(0.2);
  const { Experience } = await import('../experience/Experience.ts');
  loadingScreen?.setProgress(0.8);
  new Experience(target).start();
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
