import { chapters, findChapter } from '../../content/chapters.ts';
import { profile } from '../../content/profile.ts';
import { archiveProjects } from '../../content/projects.ts';
import type { ArchiveProject, ChapterId, World } from '../../content/types.ts';
import { ui } from '../../content/ui.ts';
import { worlds } from '../../content/worlds.ts';
import { formatIndex, formatMonth } from '../../shared/i18n/format.ts';
import type { Locale } from '../../shared/i18n/locales.ts';
import { hirePath, projectPath } from '../../shared/i18n/paths.ts';
import { renderExperienceStage } from '../components/experience-stage.ts';
import { html, type SafeHtml } from '../html.ts';
import type { PageContext, PageDocument } from '../page.ts';
import { homeStructuredData } from '../seo/structured-data.ts';

function renderChapter(id: ChapterId, locale: Locale, modifier: string, body: SafeHtml): SafeHtml {
  const chapter = findChapter(id);
  const index = chapters.indexOf(chapter) + 1;
  return html`<section class="chapter chapter--${modifier}" id="${chapter.anchor[locale]}" data-chapter="${id}" data-chapter-label="${chapter.label[locale]}" aria-labelledby="${id}-title">
  ${index > 1 ? html`<p class="chapter__index" aria-hidden="true">${formatIndex(index)} / ${formatIndex(chapters.length)}</p>` : null}
  ${body}
</section>`;
}

function renderArchiveProject(project: ArchiveProject, locale: Locale): SafeHtml {
  const collaborators = project.collaborators.length
    ? html`<dt>${ui.projectCollaborators[locale]}</dt>
      <dd>${project.collaborators.map((person, index) => html`${index > 0 ? ', ' : null}${person.href ? html`<a href="${person.href}" rel="noopener" target="_blank" data-cursor="${ui.cursorExternal[locale]}">${person.name}</a>` : person.name}`)}</dd>`
    : null;

  return html`<li class="archive-item" data-project="${project.id}">
  <article>
    <h3 class="archive-item__title">${project.title}</h3>
    ${project.summary ? html`<p class="archive-item__summary">${project.summary[locale]}</p>` : null}
    <dl class="archive-item__facts">
      <dt>${ui.projectFields[locale]}</dt>
      <dd>${project.fields[locale].join(', ')}</dd>
      <dt>${ui.projectTools[locale]}</dt>
      <dd>${project.tools.join(', ')}</dd>
      ${collaborators}
      <dt>${ui.projectPublished[locale]}</dt>
      <dd><time datetime="${project.publishedOn}">${formatMonth(project.publishedOn, locale)}</time></dd>
    </dl>
    <ul class="archive-item__links">${project.links.map((link) => html`<li><a href="${link.href}" rel="noopener" target="_blank" data-cursor="${ui.cursorExternal[locale]}">${link.label[locale]}</a></li>`)}</ul>
  </article>
</li>`;
}

function renderWorld(world: World, locale: Locale): SafeHtml {
  const projects = world.projectIds.flatMap((id) => {
    const project = archiveProjects.find((candidate) => candidate.id === id);
    return project ? [renderArchiveProject(project, locale)] : [];
  });

  return renderChapter(
    world.id,
    locale,
    'world',
    html`<p class="eyebrow">${world.eyebrow[locale]}</p>
  <h2 class="chapter__title" id="${world.id}-title" data-reveal>${world.title[locale]}</h2>
  <p class="chapter__lead" data-reveal>${world.summary[locale]}</p>
  ${projects.length ? html`<ul class="archive-list">${projects}</ul>` : null}
  ${world.page ? html`<a class="chapter__action" href="${projectPath(locale, world.slug)}" data-cursor="${ui.cursorExplore[locale]}">${ui.exploreWorld[locale]}</a>` : null}`,
  );
}

export function renderHomePage(context: PageContext): PageDocument {
  const { locale, route } = context;
  const title = ui.homeTitle[locale];

  const main = html`${renderChapter(
    'hero',
    locale,
    'hero',
    html`<h1 class="hero__title" id="hero-title">
    <span class="hero__name">${profile.name}</span>
    <span class="hero__role">${profile.role[locale]}</span>
  </h1>`,
  )}
${renderChapter(
  'about',
  locale,
  'about',
  html`<h2 class="chapter__title" id="about-title" data-reveal>${profile.about.heading[locale]}</h2>
  ${profile.about.paragraphs[locale].map((paragraph) => html`<p data-reveal>${paragraph}</p>`)}`,
)}
${worlds.map((world) => renderWorld(world, locale))}
${renderChapter(
  'contact',
  locale,
  'contact',
  html`<h2 class="chapter__title" id="contact-title" data-reveal>${ui.contactHeading[locale]}</h2>
  <p class="chapter__lead" data-reveal>${ui.contactBody[locale]}</p>
  <a class="chapter__action" href="${hirePath(locale)}" data-cursor="${ui.cursorStart[locale]}">${ui.contactAction[locale]}</a>`,
)}`;

  return {
    meta: {
      title,
      description: ui.homeDescription[locale],
      openGraphType: 'profile',
      structuredData: homeStructuredData(locale, route.path, title),
    },
    label: findChapter('hero').label[locale],
    main,
    overlay: renderExperienceStage(context),
  };
}
