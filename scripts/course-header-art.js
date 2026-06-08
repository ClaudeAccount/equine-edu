(function () {
  const scriptUrl = document.currentScript ? document.currentScript.src : window.location.href;
  const assetBase = new URL('../images/course-headers/', scriptUrl);
  const path = window.location.pathname.toLowerCase();

  const courseFallbacks = [
    { test: 'face-markings', file: 'face-markings.png', alt: 'Horse face markings illustration' },
    { test: 'leg-markings', file: 'leg-markings.png', alt: 'Horse leg markings illustration' },
    { test: 'base-coat-colors', file: 'base-coat-colors.png', alt: 'Horse base coat colors illustration' },
    { test: 'parts-of-horse', file: 'parts-of-horse.png', alt: 'Horse anatomy illustration' },
    { test: 'common-horse-terms', file: 'common-horse-terms.png', alt: 'Common horse terms illustration' }
  ];

  const shortNameMap = {
    'courses/all-courses/colors-markings/face-markings/index': 'face-index',
    'courses/all-courses/colors-markings/face-markings/intro': 'face-intro',
    'courses/all-courses/colors-markings/face-markings/face-anatomy': 'face-anatomy',
    'courses/all-courses/colors-markings/face-markings/common-face-markings': 'face-common',
    'courses/all-courses/colors-markings/face-markings/combination-face-markings': 'face-combination',
    'courses/all-courses/colors-markings/face-markings/irregular-face-markings': 'face-irregular',
    'courses/all-courses/colors-markings/face-markings/real-horses-real-markings': 'face-real-horses',
    'courses/all-courses/colors-markings/face-markings/face-marking-games': 'face-games',
    'courses/all-courses/colors-markings/face-markings/face-markings-quiz': 'face-quiz',

    'courses/all-courses/colors-markings/leg-markings/index': 'leg-index',
    'courses/all-courses/colors-markings/leg-markings/intro': 'leg-intro',
    'courses/all-courses/colors-markings/leg-markings/leg-anatomy': 'leg-anatomy',
    'courses/all-courses/colors-markings/leg-markings/leg-markings': 'leg-markings',
    'courses/all-courses/colors-markings/leg-markings/real-horses-real-leg-markings': 'leg-real-horses',
    'courses/all-courses/colors-markings/leg-markings/leg-marking-games': 'leg-games',
    'courses/all-courses/colors-markings/leg-markings/leg-markings-quiz': 'leg-quiz',

    'courses/all-courses/colors-markings/base-coat-colors/index': 'base-index',
    'courses/all-courses/colors-markings/base-coat-colors/intro': 'courses-all-courses-colors-markings-base-coat-colors-intro',
    'courses/all-courses/colors-markings/base-coat-colors/pigment-basics': 'base-pigment',
    'courses/all-courses/colors-markings/base-coat-colors/chestnut-horses': 'base-chestnut',
    'courses/all-courses/colors-markings/base-coat-colors/black-horses': 'base-black',
    'courses/all-courses/colors-markings/base-coat-colors/bay-horses': 'base-bay',
    'courses/all-courses/colors-markings/base-coat-colors/comparing-base-colors': 'base-comparing',
    'courses/all-courses/colors-markings/base-coat-colors/real-horses-real-base-colors': 'base-real-horses',
    'courses/all-courses/colors-markings/base-coat-colors/base-coat-color-games': 'base-games',
    'courses/all-courses/colors-markings/base-coat-colors/base-coat-colors-quiz': 'base-quiz',
    'courses/all-courses/colors-markings/base-coat-colors/base-color-comparison-chart': 'base-chart',
    'courses/all-courses/colors-markings/base-coat-colors/black-points-reference-guide': 'base-black-points',
    'courses/all-courses/colors-markings/base-coat-colors/common-misidentification-cheat-sheet': 'base-mistakes',
    'courses/all-courses/colors-markings/base-coat-colors/beginner-terminology-glossary': 'base-glossary',

    'courses/equine-anatomy/index':          'horse-parts-index',
    'courses/equine-anatomy/anatomy-intro':  'horse-parts-intro',
    'courses/equine-anatomy/anatomy-parts':  'horse-parts-head',
    'courses/equine-anatomy/anatomy-review': 'horse-parts-review',
    'courses/equine-anatomy/anatomy-quiz':   'horse-parts-quiz',

    'courses/all-courses/common-horse-terms/index': 'terms-index',
    'courses/all-courses/common-horse-terms/horse-basics-identification': 'terms-identification',
    'courses/all-courses/common-horse-terms/anatomy-vocabulary': 'terms-anatomy',
    'courses/all-courses/common-horse-terms/movement-gaits': 'terms-gaits',
    'courses/all-courses/common-horse-terms/tack-equipment': 'terms-tack',
    'courses/all-courses/common-horse-terms/care-barn-terms': 'terms-care',
    'courses/all-courses/common-horse-terms/riding-instruction-terms': 'terms-instruction',
    'courses/all-courses/common-horse-terms/health-safety-terms': 'terms-safety',
    'courses/all-courses/common-horse-terms/common-horse-terms-games': 'terms-games',
    'courses/all-courses/common-horse-terms/common-horse-terms-quiz': 'terms-quiz'
  };

  const match = courseFallbacks.find(item => path.includes(item.test)) || {
    file: 'all-courses.png',
    alt: 'Equine education illustration'
  };

  function normalizedPagePath() {
    let pagePath = path.replace(/^\/+/, '');
    const marker = 'courses/all-courses/';
    const markerIndex = pagePath.indexOf(marker);

    if (markerIndex >= 0) {
      pagePath = pagePath.slice(markerIndex);
    }

    if (pagePath.endsWith('/')) {
      pagePath += 'index.html';
    }

    return pagePath.replace(/\.html$/, '');
  }

  function longKeyFromPagePath(pagePath) {
    return pagePath
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function pageImageKeys() {
    const pagePath = normalizedPagePath();
    const keys = [];
    keys.push(longKeyFromPagePath(pagePath));

    if (shortNameMap[pagePath]) {
      keys.push(shortNameMap[pagePath]);
    }

    /* equine-anatomy aliases removed (paths mapped directly above) */

    return keys.filter((key, index, list) => key && list.indexOf(key) === index);
  }

  const style = document.createElement('style');
  style.textContent = `
    .course-header-art {
      width: 100%;
      max-width: 340px;
      justify-self: center;
      align-self: center;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .course-header-art img {
      width: 100%;
      height: 100%;
      max-height: 260px;
      object-fit: contain;
      object-position: center;
      display: block;
      filter: drop-shadow(0 14px 30px rgba(0,0,0,0.28));
    }

    .lesson-hero-inner.course-header-with-art,
    .page-hero-inner.course-header-with-art {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 340px;
      gap: 5rem;
      align-items: center;
      max-width: 1220px;
      margin-left: auto;
      margin-right: auto;
    }

    .course-hero-inner.course-header-with-art {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(260px, 380px);
      gap: 60px;
      align-items: center;
      max-width: 1220px;
      margin-left: auto;
      margin-right: auto;
    }

    .lesson-hero-inner.course-header-with-art .course-header-art {
      width: 340px;
      max-width: 340px;
    }

    .course-hero-inner.course-header-with-art .course-header-art {
      width: 100%;
      max-width: 380px;
    }

    .enroll-card-image.course-header-art {
      max-width: none;
      height: 190px;
      min-height: 190px;
      background: var(--off-white, #F9F6EF);
      background-color: var(--off-white, #F9F6EF);
      border-bottom: 1px solid rgba(201,168,76,0.25);
      box-shadow: none;
      padding: 1rem;
    }

    .enroll-card-image.course-header-art img {
      width: 100%;
      height: 100%;
      max-width: 320px;
      max-height: 190px;
      object-fit: contain;
      object-position: center;
      margin: 0 auto;
    }

    .page-hero.course-header-with-art,
    .quiz-hero.course-header-with-art,
    .game-hero.course-header-with-art {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 340px;
      gap: 5rem;
      align-items: center;
      text-align: left;
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
    }

    .page-hero.course-header-with-art > h1,
    .page-hero.course-header-with-art > p,
    .page-hero.course-header-with-art > .game-jump {
      max-width: 680px;
    }

    .hero-visual.course-header-art,
    .lesson-hero-right.course-header-art,
    .hero-card-image.course-header-art {
      background: transparent !important;
      background-color: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      padding: 0 !important;
      min-height: 0 !important;
      overflow: visible !important;
    }

    @media (max-width: 1024px) {
      .lesson-hero-inner.course-header-with-art,
      .page-hero-inner.course-header-with-art,
      .page-hero.course-header-with-art,
      .course-hero-inner.course-header-with-art,
      .quiz-hero.course-header-with-art,
      .game-hero.course-header-with-art {
        grid-template-columns: 1fr;
      }

      .course-header-art {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  function imageSources() {
    const fallbackSrc = new URL(match.file, assetBase).href;
    const keys = pageImageKeys();
    const srcs = keys.flatMap(key => [
      new URL(`pages/${key}.png`, assetBase).href,
      new URL(`pages/${key}.png.png`, assetBase).href,
      new URL(`${key}.png`, assetBase).href,
      new URL(`${key}.png.png`, assetBase).href
    ]);
    srcs.push(fallbackSrc);
    return srcs;
  }

  function configureImage(img) {
    const srcs = imageSources();
    let srcIndex = 0;

    function tryNextImage() {
      if (srcIndex < srcs.length) {
        img.src = srcs[srcIndex];
        srcIndex += 1;
        return;
      }

      img.onerror = null;
    }

    img.alt = match.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onerror = tryNextImage;
    tryNextImage();
    return img;
  }

  function buildImage() {
    return configureImage(document.createElement('img'));
  }

  function addArt(container) {
    if (!container) return;

    const image = buildImage();
    const directImg = container.querySelector('img.lesson-hero-img');

    if (directImg) {
      configureImage(directImg);
      directImg.classList.add('course-header-art');
      return;
    }

    const enrollCard = container.querySelector('.enroll-card');
    if (enrollCard) {
      let enrollImage = enrollCard.querySelector('.enroll-card-image');
      if (!enrollImage) {
        enrollImage = document.createElement('div');
        enrollImage.className = 'enroll-card-image';
        enrollCard.insertBefore(enrollImage, enrollCard.firstElementChild);
      }
      enrollImage.innerHTML = '';
      enrollImage.classList.add('course-header-art');
      enrollImage.appendChild(image);
      return;
    }

    let existingSlot = container.querySelector('.lesson-hero-right, .hero-visual, .hero-card-image, .enroll-card-image');

    if (!existingSlot) {
      const placeholderSlot = Array.from(container.children).find(child => child.querySelector && child.querySelector('.lesson-hero-img, .placeholder-leg'));
      if (placeholderSlot) existingSlot = placeholderSlot;
    }

    if (existingSlot && existingSlot !== container) {
      existingSlot.innerHTML = '';
      existingSlot.classList.add('course-header-art');
      existingSlot.appendChild(image);
      return;
    }

    if (container.querySelector('.course-header-art')) return;

    const art = document.createElement('div');
    art.className = 'course-header-art';
    art.appendChild(image);
    container.appendChild(art);
    container.classList.add('course-header-with-art');
  }

  document.querySelectorAll('.lesson-hero-inner, .page-hero-inner, .course-hero-inner').forEach(addArt);

  document.querySelectorAll('.page-hero').forEach(hero => {
    if (!hero.querySelector('.page-hero-inner')) addArt(hero);
  });
})();
