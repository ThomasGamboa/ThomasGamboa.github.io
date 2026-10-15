import '../styles/main.css';
import '../styles/components/hire-form.css';
import { HireForm } from '../hiring/HireForm.ts';
import { startInterface } from '../ui/interface.ts';

startInterface();

const form = document.querySelector<HTMLFormElement>('[data-hire-form]');
if (form) {
  new HireForm(form);
}
