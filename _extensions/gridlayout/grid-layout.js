// grid-layout: CSS Grid layout plugin for Reveal.js
// Converts Quarto attributes to CSS variables for .grid containers

window.gridlayout = function() {
  function processLayouts() {
    // Process .grid containers
    document.querySelectorAll('.grid').forEach(el => {
      const cols = el.getAttribute('cols');
      const rows = el.getAttribute('rows');
      const gap = el.getAttribute('data-gap') || el.getAttribute('gap');
      if (cols) el.style.setProperty('--cols', cols);
      if (rows) {
        el.style.setProperty('--rows', rows);
        // Mark grids with fr units in rows for special flex handling
        if (/\dfr/.test(rows)) {
          el.dataset.frRows = 'true';
        }
      }
      if (gap) el.style.setProperty('--gap', gap);
    });

    // Process span classes on .slot elements
    document.querySelectorAll('.slot').forEach(slot => {
      const spanMatch = [...slot.classList].find(c => /^span-(\d+)$/.test(c));
      if (spanMatch) {
        slot.style.gridColumn = `span ${spanMatch.match(/\d+/)[0]}`;
      }
      const rowSpanMatch = [...slot.classList].find(c => /^row-span-(\d+)$/.test(c));
      if (rowSpanMatch) {
        slot.style.gridRow = `span ${rowSpanMatch.match(/\d+/)[0]}`;
      }
    });
  }

  return {
    id: 'gridlayout',
    init: function(deck) {
      deck.on('ready', processLayouts);
      deck.on('slidechanged', processLayouts);
    }
  };
};
