// masonry: CSS Grid + smart reflow algorithm for Reveal.js

window.masonry = function() {
  const ROW_HEIGHT = 10;

  // Check if element has user-defined styles (inline style or non-Quarto classes)
  function hasUserStyles(el) {
    if (el.style.cssText) return true;
    const quartoClasses = ['quarto-figure', 'quarto-figure-center', 'quarto-figure-left', 'quarto-figure-right'];
    return Array.from(el.classList).some(cls => !quartoClasses.includes(cls));
  }

  // Prepare masonry items from container children
  function prepareItems(container) {
    Array.from(container.children).forEach(child => {
      if (child.classList.contains('masonry-item')) return;

      const media = child.querySelector('img, video');
      if (!media) {
        // No media, just add class for non-media items
        child.classList.add('masonry-item');
        return;
      }

      // Check if this is a pure Quarto wrapper (no user customization)
      const isQuartoWrapper = child.matches('p, figure, .quarto-figure, .quarto-figure-center');

      if (isQuartoWrapper && !hasUserStyles(child)) {
        // Pure Quarto wrapper - replace with clean .masonry-item
        const item = document.createElement('div');
        item.className = 'masonry-item';
        const link = media.closest('a.lightbox');
        item.appendChild(link ? link.cloneNode(true) : media.cloneNode(true));
        child.replaceWith(item);
      } else {
        // User-defined wrapper (has style or custom classes)
        // Transfer styles to media element, then clean up
        const item = document.createElement('div');
        item.className = 'masonry-item';

        // Transfer user styles to media
        if (child.style.cssText) {
          media.style.cssText += child.style.cssText;
        }

        // Transfer user classes to media (except quarto classes)
        child.classList.forEach(cls => {
          if (!['quarto-figure', 'quarto-figure-center', 'quarto-figure-left', 'quarto-figure-right'].includes(cls)) {
            media.classList.add(cls);
          }
        });

        const link = media.closest('a.lightbox');
        item.appendChild(link ? link.cloneNode(true) : media.cloneNode(true));
        child.replaceWith(item);
      }
    });
  }

  // Get element dimensions (works for media and arbitrary elements)
  function getElementSize(el) {
    const media = el.querySelector('img, video');
    if (media) {
      const isVideo = media.tagName === 'VIDEO';
      const width = isVideo ? media.videoWidth : media.naturalWidth;
      const height = isVideo ? media.videoHeight : media.naturalHeight;
      if (width > 0) return { width, height };
    }
    // Fallback to rendered size
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  function calculateSpan(size, columnWidth, gutter) {
    if (size.width <= 0) return 1;
    const aspectRatio = size.height / size.width;
    const itemHeight = columnWidth * aspectRatio;
    return Math.max(1, Math.ceil((itemHeight + gutter) / (ROW_HEIGHT + gutter)));
  }

  function layoutMasonry(container) {
    const gutter = parseInt(container.dataset.gutter) || 8;
    const columns = parseInt(container.dataset.columns) || 0;

    if (columns > 0) {
      container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    } else {
      container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
    }
    container.style.gridAutoRows = `${ROW_HEIGHT}px`;
    container.style.gap = `${gutter}px`;

    const computedStyle = getComputedStyle(container);
    const containerWidth = container.clientWidth -
      parseFloat(computedStyle.paddingLeft) -
      parseFloat(computedStyle.paddingRight);
    const gridColumns = computedStyle.gridTemplateColumns.split(' ').length;
    const columnWidth = (containerWidth - gutter * (gridColumns - 1)) / gridColumns;

    container.querySelectorAll('.masonry-item').forEach(item => {
      const size = getElementSize(item);
      const span = calculateSpan(size, columnWidth, gutter);
      item.style.gridRowEnd = `span ${span}`;
    });

    container.dataset.masonryInit = 'true';
  }

  function loadMedia(media) {
    return new Promise(resolve => {
      const isVideo = media.tagName === 'VIDEO';
      const src = media.dataset.src || media.src;
      if (!src || src.endsWith('/')) { resolve(); return; }

      if (media.dataset.src) {
        media.src = media.dataset.src;
        delete media.dataset.src;
      }

      if (isVideo) {
        media.videoWidth > 0 ? resolve() : (media.onloadedmetadata = resolve, media.onerror = resolve);
      } else {
        media.complete && media.naturalWidth > 0 ? resolve() : (media.onload = resolve, media.onerror = resolve);
      }
    });
  }

  function initMasonry() {
    document.querySelectorAll('.masonry').forEach(async container => {
      if (container.dataset.masonryInit === 'true') return;

      prepareItems(container);

      const mediaElements = Array.from(container.querySelectorAll('.masonry-item img, .masonry-item video'));
      await Promise.all(mediaElements.map(loadMedia));

      layoutMasonry(container);
    });
  }

  return {
    id: 'masonry',
    init: deck => {
      deck.on('ready', () => setTimeout(initMasonry, 100));
      deck.on('slidechanged', () => setTimeout(initMasonry, 100));
    }
  };
};
