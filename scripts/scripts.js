import { returnLinkTarget } from '../utils/helpers.js';
import {
  sampleRUM,
  buildBlock,
  loadBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlock,
  decorateBlocks,
  decorateTemplateAndTheme,
  getMetadata,
  toClassName,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './lib-franklin.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list
let templateModule;

export function addMessageBoxOnGuideTemplate(main) {
  const messageBox = createTag('div', { class: 'message-box' }, 'Link copied!');
  main.append(messageBox);
}

export function addHeadingAnchorLink(elem) {
  const link = document.createElement('a');
  link.setAttribute('href', `#${elem.id || ''}`);
  link.setAttribute('title', `Copy link to "${elem.textContent}" to clipboard`);
  // hover highlight on title
  if (elem.tagName === 'H2') {
    link.classList.add('anchor-link', 'link-highlight-colorful-effect');
  } else {
    link.classList.add('anchor-link', 'link-highlight-colorful-effect-2');
  }
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(link.href);
    window.location.href = link.href;
    const messageBox = document.querySelector('.message-box');
    if (messageBox) {
      messageBox.classList.add('active', 'fill');
      setTimeout(() => {
        messageBox.classList.remove('active');
        setTimeout(() => {
          messageBox.classList.remove('fill');
        }, 300);
      }, 1000);
    }

    e.target.classList.add('anchor-link-copied');
    setTimeout(() => {
      e.target.classList.remove('anchor-link-copied');
    }, 1000);
  });
  link.innerHTML = elem.innerHTML;
  elem.innerHTML = '';
  elem.append(link);
}

export function decorateGuideTemplateHeadings(main) {
  const contentArea = main.querySelector('.section.content');
  if (!contentArea) return;
  const contentSections = contentArea.querySelectorAll('.default-content-wrapper');
  if (!contentSections) return;
  contentSections.forEach((section) => {
    section.querySelectorAll('h2, h3, h4, h5, h6').forEach((h) => {
      addHeadingAnchorLink(h);
    });
  });
}

export function decorateGuideTemplateHero(main) {
  if (main.classList.contains('without-full-width-hero'));
  const firstImageInContentArea = main.querySelector('.section.content .default-content-wrapper img');
  if (firstImageInContentArea) firstImageInContentArea.classList.add('doc-detail-hero-image');
}

export function decorateGuideTemplateLinks(main) {
  const links = main.querySelectorAll('.content a');
  links.forEach((link) => {
    link.setAttribute('target', returnLinkTarget(link.href));
  });
}

export async function decorateGuideTemplateCodeBlock() {
  if (!document.body.classList.contains('guides-template')) return;

  const highlightCSS = createTag('link', {
    rel: 'stylesheet',
    href: '/libs/highlight/atom-one-dark.min.css',
  });
  document.head.append(highlightCSS);

  await loadScript('/libs/highlight/highlight.min.js', () => {
    const initScript = createTag('script', {}, 'hljs.highlightAll();');
    document.body.append(initScript);
  });
}

// patch fix for table not being rendered as block in fragment
export function decorateFragmentTable(main) {
  if (!main) return;
  const tables = main.querySelectorAll('table');
  if (tables) {
    tables.forEach((table) => {
      if (table.classList.contains('block')) return;
      const tableWrapper = createTag('div', { class: 'table' });
      table.parentNode.insertBefore(tableWrapper, table);
      tableWrapper.appendChild(table);
    });
  }
}

export function decorateGuideTemplate(main) {
  if (!document.body.classList.contains('guides-template') || !main) return;
  addMessageBoxOnGuideTemplate(main);
  decorateGuideTemplateHeadings(main);
  decorateGuideTemplateHero(main);
  decorateGuideTemplateLinks(main);
  decorateGuideTemplateCodeBlock();
  decorateFragmentTable(main);
}



/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

function buildHeader() {
  const header = document.querySelector('header');
  header.append(buildBlock('header', ''));
}


function updateGuideTemplateStyleBasedOnHero() {
  const isHeroContentExist = document.querySelector('.guides-template .section.heading');

  if (isHeroContentExist) {
    document.querySelector('main').classList.add('has-full-width-hero');
    const cardListBlocks = document.querySelectorAll('.block.card-list');
    // make card list in main category page has '.image-card-listing' class
    cardListBlocks.forEach((block) => block.classList.add('image-card-listing'));
  } else {
    document.querySelector('main').classList.add('without-full-width-hero');
  }
}


/**
 * Builds template block and adds to main as sections.
 * @param {Element} main The container element.
 * @returns {Promise} Resolves when the template block(s) have
 *  been loaded.
 */
async function decorateTemplate(main) {
  const template = toClassName(getMetadata('template'));
  if (!template || template === 'generic') {
    return;
  }

  try {
    const cssLoaded = loadCSS(`${window.hlx.codeBasePath}/templates/${template}/${template}.css`);
    const decorationComplete = new Promise((resolve) => {
      (async () => {
        try {
          templateModule = await import(`../templates/${template}/${template}.js`);
          if (templateModule?.loadEager) {
            await templateModule.loadEager(main);
          }
        } catch (error) {
          if (error.message === '404') {
            await render404();
          }
          // eslint-disable-next-line no-console
          console.log(`failed to load template for ${template}`, error);
        }
        resolve();
      })();
    });
    await Promise.all([cssLoaded, decorationComplete]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`failed to load template ${template}`, error);
  }
}

/**
 * Clean up variant classes
 * Ex: marquee--small--contained- -> marquee small contained
 * @param {HTMLElement} parent
 */
export function cleanVariations(parent) {
  const variantBlocks = parent.querySelectorAll('[class$="-"]');
  return Array.from(variantBlocks).map((variant) => {
    const { className } = variant;
    const classNameClipped = className.slice(0, -1);
    variant.classList.remove(className);
    const classNames = classNameClipped.split('--');
    variant.classList.add(...classNames);
    return variant;
  });
}

/**
 * Helper function to create DOM elements
 * @param {string} tag DOM element to be created
 * @param {array} attributes attributes to be added
 */

export function createTag(tag, attributes, html) {
  const el = document.createElement(tag);
  if (html) {
    if (html instanceof HTMLElement || html instanceof SVGElement) {
      el.append(html);
    } else {
      el.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }
  return el;
}

export function loadScript(url, callback, type) {
  const script = document.createElement('script');
  script.onload = callback;
  script.setAttribute('src', url);
  if (type) { script.setAttribute('type', type); }
  document.head.append(script);
  return script;
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeader();
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateGuideTemplate(main);
  decorateBlocks(main);
}


/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    await decorateTemplate(main);
    await decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.replaceWith(link);
  } else {
    document.head.append(link);
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  const header = doc.querySelector('header > div');
  const aside = createTag('aside');
  main.insertBefore(aside, main.querySelector('.section.content'));

  document.body.classList.add('redesign');
  if (templateModule?.loadLazy) {
    templateModule.loadLazy(main);
  }
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  //loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.png`);

  decorateBlock(header);
  loadBlock(header);

  // sidebar + related style setup
  const sideNav = buildBlock('side-navigation', '');
  aside.append(sideNav);
  //main.insertBefore(aside, main.querySelector('.section.content'));
  updateGuideTemplateStyleBasedOnHero();
  decorateBlock(sideNav);
  loadBlock(sideNav);
  
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed(doc) {
  // eslint-disable-next-line import/no-cycle
  // load anything that can be postponed to the latest here
  window.setTimeout(() => {
    if (templateModule?.loadDelayed) {
      templateModule.loadDelayed(doc);
    }
    // eslint-disable-next-line import/no-cycle
    return import('./delayed.js');
  }, 3000);
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
