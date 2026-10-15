import { chapters, findChapter } from '../../content/chapters.ts';
import { profile } from '../../content/profile.ts';
import { archiveProjects } from '../../content/projects.ts';
import type { ArchiveProject, ChapterId, World } from '../../content/types.ts';
import { ui } from '../../content/ui.ts';
import { worlds } from '../../content/worlds.ts';
import { formatIndex, formatMonth } from '../../shared/i18n/format.ts';
import type { Locale } from '../../shared/i18n/locales.ts';
import { hirePath, projectPath } from '../../shared/i18n/paths.ts';
import { renderContentBlocks } from '../components/content-blocks.ts';
import { renderExperienceStage } from '../components/experience-stage.ts';
import { renderHighlights } from '../components/highlights.ts';
import { html, type SafeHtml } from '../html.ts';
import { mediaLibrary } from '../media.ts';
import type { PageContext, PageDocument } from '../page.ts';
import { homeStructuredData } from '../seo/structured-data.ts';

function renderChapter(id: ChapterId, locale: Locale, modifier: string, body: SafeHtml): SafeHtml {
  const chapter = findChapter(id);
  const index = chapters.indexOf(chapter) + 1;
  return html`<section class="chapter chapter--${modifier}" id="${chapter.anchor[locale]}" data-chapter="${id}" data-chapter-label="${chapter.label[locale]}" aria-labelledby="${id}-title">
  <div class="chapter__panel surface">
  ${index > 1 ? html`<p class="chapter__index" aria-hidden="true">${formatIndex(index)} / ${formatIndex(chapters.length)}</p>` : null}
  ${body}
  </div>
</section>`;
}

function sheetId(project: ArchiveProject): string {
  return `sheet-${project.id}`;
}

function renderProjectMeta(project: ArchiveProject, locale: Locale): SafeHtml {
  return html`${project.fields[locale].join(', ')} · <time datetime="${project.publishedOn}">${formatMonth(project.publishedOn, locale)}</time>`;
}

function renderArchiveProject(project: ArchiveProject, locale: Locale): SafeHtml {
  return html`<li class="archive-item" data-project="${project.id}">
  <article class="archive-item__card">
    ${project.cover ? mediaLibrary.picture(project.cover, locale, { sizes: '(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 90vw', className: 'archive-item__cover' }) : null}
    <h3 class="archive-item__title"><a class="archive-item__open" href="#${sheetId(project)}" aria-haspopup="dialog" data-sheet-open data-cursor="${ui.cursorOpenProject[locale]}">${project.title}</a></h3>
    ${project.summary ? html`<p class="archive-item__summary">${project.summary[locale]}</p>` : null}
    <p class="archive-item__meta">${renderProjectMeta(project, locale)}</p>
  </article>
</li>`;
}

function renderProjectSheet(project: ArchiveProject, locale: Locale): SafeHtml {
  const id = sheetId(project);
  const poster = project.gallery[0] ?? project.cover;
  const collaborators = project.collaborators.length
    ? html`<dt>${ui.projectCollaborators[locale]}</dt>
      <dd>${project.collaborators.map((person, index) => html`${index > 0 ? ', ' : null}${person.href ? html`<a href="${person.href}" rel="noopener" target="_blank" data-cursor="${ui.cursorExternal[locale]}">${person.name}</a>` : person.name}`)}</dd>`
    : null;
  const media = [
    ...(project.video && poster
      ? [
          {
            type: 'video' as const,
            provider: 'youtube' as const,
            id: project.video.id,
            title: project.video.title,
            poster,
          },
        ]
      : []),
    ...(project.gallery.length
      ? [
          {
            type: 'gallery' as const,
            items: project.gallery,
            sizes: '(min-width: 48rem) 52vw, 100vw',
          },
        ]
      : []),
  ];

  return html`<dialog class="project-sheet surface" id="${id}" aria-labelledby="${id}-title" data-project-sheet>
  <div class="project-sheet__scroll">
    <a class="project-sheet__close" href="#${findChapter('archive').anchor[locale]}" data-sheet-close data-cursor="${ui.galleryClose[locale]}">${ui.galleryClose[locale]} <span aria-hidden="true">×</span></a>
    <header class="project-sheet__header">
      <p class="eyebrow">${renderProjectMeta(project, locale)}</p>
      <h2 class="project-sheet__title" id="${id}-title">${project.title}</h2>
      ${project.summary ? html`<p class="project-sheet__lead">${project.summary[locale]}</p>` : null}
    </header>
    <div class="project-sheet__story">${project.story[locale].map((paragraph) => html`<p>${paragraph}</p>`)}</div>
    <dl class="archive-item__facts">
      <dt>${ui.projectTools[locale]}</dt>
      <dd>${project.tools.join(', ')}</dd>
      ${collaborators}
    </dl>
    ${project.links.length ? html`<div class="chapter__actions">${project.links.map((link) => html`<a class="action" href="${link.href}" rel="noopener" target="_blank" data-cursor="${ui.cursorExternal[locale]}">${link.label[locale]}</a>`)}</div>` : null}
    ${renderContentBlocks(media, locale)}
  </div>
</dialog>`;
}

function renderWorldActions(world: World, locale: Locale): SafeHtml | null {
  if (!world.page && world.links.length === 0) {
    return null;
  }
  return html`<div class="chapter__actions">
  ${world.page ? html`<a class="chapter__action action" href="${projectPath(locale, world.slug)}" data-cursor="${ui.cursorExplore[locale]}">${world.page.action[locale]}</a>` : null}
  ${world.links.map((link) => html`<a class="chapter__action action" href="${link.href}" rel="noopener" target="_blank" data-cursor="${ui.cursorExternal[locale]}">${link.label[locale]}</a>`)}
</div>`;
}

function renderAbout(locale: Locale): SafeHtml {
  return html`<h2 class="chapter__title" id="about-title" data-reveal>${profile.about.heading[locale]}</h2>
  ${profile.about.paragraphs[locale].map((paragraph) => html`<p data-reveal>${paragraph}</p>`)}
  <section class="path" aria-labelledby="about-path-title">
    <h3 class="eyebrow" id="about-path-title">${profile.path.heading[locale]}</h3>
    <ol class="path__list">${profile.path.entries.map(
      (entry) => html`<li class="path__entry">
      <p class="path__period">${entry.period}</p>
      <div class="path__detail">
        <h4 class="path__title">${entry.title[locale]}</h4>
        <p class="path__place">${entry.place[locale]}</p>
        <p class="path__body">${entry.body[locale]}</p>
      </div>
    </li>`,
    )}</ol>
    <ul class="tool-list" aria-label="${ui.projectTools[locale]}">${profile.tools.map((tool) => html`<li>${tool}</li>`)}</ul>
  </section>`;
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
  ${renderHighlights(world.highlights, locale)}
  ${projects.length ? html`<ul class="archive-list">${projects}</ul>` : null}
  ${renderWorldActions(world, locale)}`,
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
${renderChapter('about', locale, 'about', renderAbout(locale))}
${worlds.map((world) => renderWorld(world, locale))}
${renderChapter(
  'contact',
  locale,
  'contact',
  html`<h2 class="chapter__title" id="contact-title" data-reveal>${ui.contactHeading[locale]}</h2>
  <p class="chapter__lead" data-reveal>${ui.contactBody[locale]}</p>
  <a class="chapter__action action" href="${hirePath(locale)}" data-cursor="${ui.cursorStart[locale]}">${ui.contactAction[locale]}</a>`,
)}
${archiveProjects.map((project) => renderProjectSheet(project, locale))}`;

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
