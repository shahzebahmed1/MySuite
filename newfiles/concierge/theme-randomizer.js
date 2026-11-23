/* Shared bottom-right palette & font switcher for concierge pages. */
(() => {
  const PALETTE_KEY = 'mysuite-concierge-palette';
  const FONT_KEY = 'mysuite-concierge-font';
  const FONT_BASE = '../../Point_On_The_Bow/public/fonts';

  const PALETTES = [
    {
      name: 'Espresso & Slate',
      sidebar: 'linear-gradient(155deg, #39281e, #2f241e)',
      sidebarText: '#f4ede5',
      sidebarMuted: '#c7b9ac',
      sidebarActive: 'rgba(255, 255, 255, 0.14)',
      sidebarActiveText: '#ffffff',
      bg: '#ffffff',
      surface: '#ffffff',
      surfaceAlt: '#f7f6f4',
      border: '#eae6e0',
      text: '#2f241e',
      muted: '#6e6860',
      accent: '#354f69',
      accentHover: '#293e54',
      accentText: '#ffffff',
      accentSoft: '#eef2f6',
      accentSoftHover: '#e1e8f0',
      accentSoftText: '#2c445c'
    },
    {
      name: 'Espresso & Burgundy',
      sidebar: 'linear-gradient(155deg, #39281e, #2f241e)',
      sidebarText: '#f4ede5',
      sidebarMuted: '#c7b9ac',
      sidebarActive: 'rgba(255, 255, 255, 0.14)',
      sidebarActiveText: '#ffffff',
      bg: '#ffffff',
      surface: '#ffffff',
      surfaceAlt: '#f8f6f6',
      border: '#ebe5e5',
      text: '#2f241e',
      muted: '#6e6565',
      accent: '#6e2c38',
      accentHover: '#57212b',
      accentText: '#ffffff',
      accentSoft: '#f6eef0',
      accentSoftHover: '#eddde0',
      accentSoftText: '#5e242f'
    },
    {
      name: 'Midnight Navy & Steel',
      sidebar: 'linear-gradient(155deg, #1b2838, #141e2b)',
      sidebarText: '#e9eff5',
      sidebarMuted: '#9fb1c4',
      sidebarActive: 'rgba(255, 255, 255, 0.14)',
      sidebarActiveText: '#ffffff',
      bg: '#ffffff',
      surface: '#ffffff',
      surfaceAlt: '#f5f7fa',
      border: '#e3e8ee',
      text: '#1b2838',
      muted: '#5e6b7a',
      accent: '#2c5282',
      accentHover: '#214066',
      accentText: '#ffffff',
      accentSoft: '#edf2f8',
      accentSoftHover: '#dee7f2',
      accentSoftText: '#23446d'
    },
    {
      name: 'Charcoal & Plum',
      sidebar: 'linear-gradient(155deg, #262429, #1c1a1e)',
      sidebarText: '#eeecf2',
      sidebarMuted: '#ada7b5',
      sidebarActive: 'rgba(255, 255, 255, 0.14)',
      sidebarActiveText: '#ffffff',
      bg: '#ffffff',
      surface: '#ffffff',
      surfaceAlt: '#f7f6f8',
      border: '#e7e4eb',
      text: '#262429',
      muted: '#686370',
      accent: '#5b3a66',
      accentHover: '#472c50',
      accentText: '#ffffff',
      accentSoft: '#f3eef5',
      accentSoftHover: '#e7dfeb',
      accentSoftText: '#4c3056'
    },
    {
      name: 'Walnut & Prussian Teal',
      sidebar: 'linear-gradient(155deg, #3b2d23, #2c2119)',
      sidebarText: '#f4ede6',
      sidebarMuted: '#c2b4a7',
      sidebarActive: 'rgba(255, 255, 255, 0.14)',
      sidebarActiveText: '#ffffff',
      bg: '#fdfcfb',
      surface: '#ffffff',
      surfaceAlt: '#f5f7f7',
      border: '#e5e8e8',
      text: '#2c2119',
      muted: '#646b6b',
      accent: '#245963',
      accentHover: '#1b454d',
      accentText: '#ffffff',
      accentSoft: '#ebf3f5',
      accentSoftHover: '#dce9ec',
      accentSoftText: '#1e4b54'
    },
    {
      name: 'Deep Ink & Cobalt',
      sidebar: 'linear-gradient(155deg, #1e222a, #15181e)',
      sidebarText: '#eceff4',
      sidebarMuted: '#9aa4b5',
      sidebarActive: 'rgba(255, 255, 255, 0.14)',
      sidebarActiveText: '#ffffff',
      bg: '#ffffff',
      surface: '#ffffff',
      surfaceAlt: '#f6f7f9',
      border: '#e4e7ec',
      text: '#1e222a',
      muted: '#5f6775',
      accent: '#2b4c8c',
      accentHover: '#203a6d',
      accentText: '#ffffff',
      accentSoft: '#edf1f8',
      accentSoftHover: '#dfe6f3',
      accentSoftText: '#233f75'
    },
    {
      name: 'Oxblood & Slate',
      sidebar: 'linear-gradient(155deg, #3d1e24, #2b1419)',
      sidebarText: '#f5ecee',
      sidebarMuted: '#c4a6ac',
      sidebarActive: 'rgba(255, 255, 255, 0.14)',
      sidebarActiveText: '#ffffff',
      bg: '#fcfbfa',
      surface: '#ffffff',
      surfaceAlt: '#f7f5f6',
      border: '#eae4e6',
      text: '#2b1419',
      muted: '#6b5e61',
      accent: '#3a4a5c',
      accentHover: '#2c3947',
      accentText: '#ffffff',
      accentSoft: '#eef1f5',
      accentSoftHover: '#e0e6ec',
      accentSoftText: '#2f3d4d'
    },
    {
      name: 'Graphite & Indigo',
      sidebar: 'linear-gradient(155deg, #2b2e33, #1f2226)',
      sidebarText: '#eff0f2',
      sidebarMuted: '#a6abb3',
      sidebarActive: 'rgba(255, 255, 255, 0.14)',
      sidebarActiveText: '#ffffff',
      bg: '#ffffff',
      surface: '#ffffff',
      surfaceAlt: '#f6f6f8',
      border: '#e5e6eb',
      text: '#23262b',
      muted: '#646870',
      accent: '#3d4580',
      accentHover: '#2f3566',
      accentText: '#ffffff',
      accentSoft: '#eef0f8',
      accentSoftHover: '#e0e3f2',
      accentSoftText: '#32396b'
    },
    {
      name: 'Warm Stone & Espresso',
      sidebar: 'linear-gradient(155deg, #ebe6de, #dfd8cd)',
      sidebarText: '#35261e',
      sidebarMuted: '#786c61',
      sidebarActive: 'rgba(53, 38, 30, 0.12)',
      sidebarActiveText: '#241913',
      bg: '#ffffff',
      surface: '#ffffff',
      surfaceAlt: '#f7f5f2',
      border: '#e8e3dc',
      text: '#35261e',
      muted: '#73685e',
      accent: '#4e392d',
      accentHover: '#3b2b21',
      accentText: '#ffffff',
      accentSoft: '#f2eee9',
      accentSoftHover: '#e6dfd7',
      accentSoftText: '#3d2c22'
    },
    {
      name: 'Cool Mist & Navy',
      sidebar: 'linear-gradient(155deg, #e8edf2, #dce3eb)',
      sidebarText: '#1c2a3a',
      sidebarMuted: '#5b6c80',
      sidebarActive: 'rgba(28, 42, 58, 0.12)',
      sidebarActiveText: '#131f2c',
      bg: '#ffffff',
      surface: '#ffffff',
      surfaceAlt: '#f5f7fa',
      border: '#e1e6ed',
      text: '#1c2a3a',
      muted: '#5e6d7e',
      accent: '#234066',
      accentHover: '#19304d',
      accentText: '#ffffff',
      accentSoft: '#ebf0f7',
      accentSoftHover: '#dce5f2',
      accentSoftText: '#1f395c'
    },
    {
      name: 'Alabaster & Crimson',
      sidebar: 'linear-gradient(155deg, #f3f1ee, #e8e4df)',
      sidebarText: '#2c2220',
      sidebarMuted: '#786a68',
      sidebarActive: 'rgba(138, 43, 54, 0.12)',
      sidebarActiveText: '#6e1e28',
      bg: '#ffffff',
      surface: '#ffffff',
      surfaceAlt: '#f9f7f7',
      border: '#ebe6e6',
      text: '#2c2220',
      muted: '#6e6260',
      accent: '#8a2b36',
      accentHover: '#702029',
      accentText: '#ffffff',
      accentSoft: '#f8edef',
      accentSoftHover: '#f0dce0',
      accentSoftText: '#75222c'
    },
    {
      name: 'Espresso & Deep Teal',
      sidebar: 'linear-gradient(155deg, #39281e, #2f241e)',
      sidebarText: '#f4ede5',
      sidebarMuted: '#c7b9ac',
      sidebarActive: 'rgba(255, 255, 255, 0.14)',
      sidebarActiveText: '#ffffff',
      bg: '#ffffff',
      surface: '#ffffff',
      surfaceAlt: '#f5f8f8',
      border: '#e2e8e8',
      text: '#2f241e',
      muted: '#636b6b',
      accent: '#1f5f6b',
      accentHover: '#164a54',
      accentText: '#ffffff',
      accentSoft: '#eaf3f5',
      accentSoftHover: '#dae9ec',
      accentSoftText: '#194f59'
    },
    {
      name: 'Slate Grey & Berry',
      sidebar: 'linear-gradient(155deg, #383c42, #2b2e33)',
      sidebarText: '#eff1f4',
      sidebarMuted: '#a8aeb8',
      sidebarActive: 'rgba(255, 255, 255, 0.14)',
      sidebarActiveText: '#ffffff',
      bg: '#fafafa',
      surface: '#ffffff',
      surfaceAlt: '#f4f3f6',
      border: '#e6e4ea',
      text: '#26292e',
      muted: '#666970',
      accent: '#7d2e55',
      accentHover: '#632242',
      accentText: '#ffffff',
      accentSoft: '#f6edf2',
      accentSoftHover: '#eddce5',
      accentSoftText: '#692446'
    },
    {
      name: 'Cocoa & Dusty Blue',
      sidebar: 'linear-gradient(155deg, #47362b, #382a21)',
      sidebarText: '#f5eee8',
      sidebarMuted: '#cabbb0',
      sidebarActive: 'rgba(255, 255, 255, 0.14)',
      sidebarActiveText: '#ffffff',
      bg: '#fbfaf8',
      surface: '#ffffff',
      surfaceAlt: '#f4f6f8',
      border: '#e4e7eb',
      text: '#35261e',
      muted: '#696e75',
      accent: '#446380',
      accentHover: '#354f68',
      accentText: '#ffffff',
      accentSoft: '#edf2f7',
      accentSoftHover: '#dfe8f0',
      accentSoftText: '#37526b'
    },
    {
      name: 'Obsidian & Periwinkle',
      sidebar: 'linear-gradient(155deg, #1a1d24, #12141a)',
      sidebarText: '#eef0f6',
      sidebarMuted: '#99a0b2',
      sidebarActive: 'rgba(255, 255, 255, 0.14)',
      sidebarActiveText: '#ffffff',
      bg: '#ffffff',
      surface: '#ffffff',
      surfaceAlt: '#f5f6fa',
      border: '#e4e6ef',
      text: '#1a1d24',
      muted: '#5f6473',
      accent: '#46549e',
      accentHover: '#364280',
      accentText: '#ffffff',
      accentSoft: '#eef0fa',
      accentSoftHover: '#dfe3f5',
      accentSoftText: '#394585'
    },
    {
      name: 'Sandstone & Charcoal',
      sidebar: 'linear-gradient(155deg, #d9d0c3, #ccc1b2)',
      sidebarText: '#2c251f',
      sidebarMuted: '#695f55',
      sidebarActive: 'rgba(44, 37, 31, 0.12)',
      sidebarActiveText: '#1e1915',
      bg: '#fdfcfb',
      surface: '#ffffff',
      surfaceAlt: '#f6f4f1',
      border: '#e6e1da',
      text: '#2c251f',
      muted: '#6b635b',
      accent: '#3d4047',
      accentHover: '#2c2e34',
      accentText: '#ffffff',
      accentSoft: '#efeff1',
      accentSoftHover: '#e2e3e6',
      accentSoftText: '#2f3238'
    }
  ];

  const FONTS = [
    { name: 'System Default', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', faces: [] },
    {
      name: 'Sohne',
      family: '"Sohne", sans-serif',
      faces: [
        { weight: 400, file: 'sohne/TestSohne-Buch-BF663d89cd32e6a.otf', format: 'opentype' },
        { weight: 500, file: 'sohne/TestSohne-Kraftig-BF663d89cd37e26.otf', format: 'opentype' },
        { weight: 600, file: 'sohne/TestSohne-Halbfett-BF663d89cd2d67b.otf', format: 'opentype' },
        { weight: 700, file: 'sohne/TestSohne-Fett-BF663d89cca89ff.otf', format: 'opentype' }
      ]
    },
    {
      name: 'Theinhardt',
      family: '"Theinhardt", sans-serif',
      faces: [
        { weight: 400, file: 'Theinhardt-Regular.b467019.woff2', format: 'woff2' },
        { weight: 500, file: 'Theinhardt-Medium.fc38eab.woff2', format: 'woff2' },
        { weight: 600, file: 'Theinhardt-Medium.fc38eab.woff2', format: 'woff2' },
        { weight: 700, file: 'Theinhardt-Medium.fc38eab.woff2', format: 'woff2' }
      ]
    },
    {
      name: 'National',
      family: '"National", sans-serif',
      faces: [
        { weight: 400, file: 'national/TestNational-Regular-BF663c3f4a83f85.otf', format: 'opentype' },
        { weight: 500, file: 'national/TestNational-Medium-BF663c3f49d1711.otf', format: 'opentype' },
        { weight: 600, file: 'national/TestNational-Semibold-BF663c3f4a27e11.otf', format: 'opentype' },
        { weight: 700, file: 'national/TestNational-Bold-BF663c3f4919b8c.otf', format: 'opentype' }
      ]
    },
    {
      name: 'PP Mori',
      family: '"PP Mori", sans-serif',
      faces: [
        { weight: 400, file: 'pp-mori/ppmori-regular.otf', format: 'opentype' },
        { weight: 500, file: 'pp-mori/ppmori-regular.otf', format: 'opentype' },
        { weight: 600, file: 'pp-mori/ppmori-semibold.otf', format: 'opentype' },
        { weight: 700, file: 'pp-mori/ppmori-semibold.otf', format: 'opentype' }
      ]
    },
    {
      name: 'GT Walsheim',
      family: '"GT Walsheim", sans-serif',
      faces: [
        { weight: 400, file: 'gt-walsheim/GT-Walsheim-Regular-Trial-BF651b7fc71a47d.otf', format: 'opentype' },
        { weight: 500, file: 'gt-walsheim/GT-Walsheim-Medium-Trial-BF651b7fc728fb3.otf', format: 'opentype' },
        { weight: 600, file: 'gt-walsheim/GT-Walsheim-Medium-Trial-BF651b7fc728fb3.otf', format: 'opentype' },
        { weight: 700, file: 'gt-walsheim/GT-Walsheim-Bold-Trial-BF651b7fc737c57.otf', format: 'opentype' }
      ]
    },
    {
      name: 'Proxima Nova',
      family: '"Proxima Nova", sans-serif',
      faces: [
        { weight: 400, file: 'proxima-nova/proxima-nova-regular.otf', format: 'opentype' },
        { weight: 500, file: 'proxima-nova/proxima-nova-medium.otf', format: 'opentype' },
        { weight: 600, file: 'proxima-nova/proxima-nova-semibold.otf', format: 'opentype' },
        { weight: 700, file: 'proxima-nova/proxima-nova-bold.otf', format: 'opentype' }
      ]
    },
    {
      name: 'Circular Std',
      family: '"Circular Std", sans-serif',
      faces: [
        { weight: 400, file: 'circular-std/circular-std-medium-500.ttf', format: 'truetype' },
        { weight: 500, file: 'circular-std/circular-std-medium-500.ttf', format: 'truetype' },
        { weight: 600, file: 'circular-std/circular-std-medium-500.ttf', format: 'truetype' },
        { weight: 700, file: 'circular-std/circular-std-medium-500.ttf', format: 'truetype' }
      ]
    },
    {
      name: 'Metropolis',
      family: '"Metropolis", sans-serif',
      faces: [
        { weight: 400, file: 'metropolis/Metropolis-Regular.otf', format: 'opentype' },
        { weight: 500, file: 'metropolis/Metropolis-Medium.otf', format: 'opentype' },
        { weight: 600, file: 'metropolis/Metropolis-SemiBold.otf', format: 'opentype' },
        { weight: 700, file: 'metropolis/Metropolis-Bold.otf', format: 'opentype' }
      ]
    },
    {
      name: 'Sofia Pro',
      family: '"Sofia Pro", sans-serif',
      faces: [
        { weight: 400, file: 'sofia-pro/Sofia Pro Regular Az.otf', format: 'opentype' },
        { weight: 500, file: 'sofia-pro/Sofia Pro Medium Az.otf', format: 'opentype' },
        { weight: 600, file: 'sofia-pro/Sofia Pro Semi Bold Az.otf', format: 'opentype' },
        { weight: 700, file: 'sofia-pro/Sofia Pro Bold Az.otf', format: 'opentype' }
      ]
    },
    {
      name: 'Degular',
      family: '"Degular", sans-serif',
      faces: [
        { weight: 400, file: 'degular/DegularDemo-Regular.otf', format: 'opentype' },
        { weight: 500, file: 'degular/DegularDemo-Medium.otf', format: 'opentype' },
        { weight: 600, file: 'degular/DegularDemo-Semibold.otf', format: 'opentype' },
        { weight: 700, file: 'degular/DegularDemo-Bold.otf', format: 'opentype' }
      ]
    },
    {
      name: 'Soleil',
      family: '"Soleil", sans-serif',
      faces: [
        { weight: 400, file: 'soleil/SoleilRegular.otf', format: 'opentype' },
        { weight: 500, file: 'soleil/SoleilBook.otf', format: 'opentype' },
        { weight: 600, file: 'soleil/SoleilBold.otf', format: 'opentype' },
        { weight: 700, file: 'soleil/SoleilBold.otf', format: 'opentype' }
      ]
    },
    {
      name: 'Sailec',
      family: '"Sailec", sans-serif',
      faces: [
        { weight: 400, file: 'sailec/Sailec Medium.ttf', format: 'truetype' },
        { weight: 500, file: 'sailec/Sailec Medium.ttf', format: 'truetype' },
        { weight: 600, file: 'sailec/Sailec Bold.ttf', format: 'truetype' },
        { weight: 700, file: 'sailec/Sailec Bold.ttf', format: 'truetype' }
      ]
    },
    {
      name: 'Averta',
      family: '"Averta", sans-serif',
      faces: [
        { weight: 400, file: 'averta/AvertaDemoPECuttedDemo-Regular.otf', format: 'opentype' },
        { weight: 500, file: 'averta/AvertaDemoPECuttedDemo-Regular.otf', format: 'opentype' },
        { weight: 600, file: 'averta/AvertaDemoPE-ExtraBold.otf', format: 'opentype' },
        { weight: 700, file: 'averta/AvertaDemoPE-ExtraBold.otf', format: 'opentype' }
      ]
    },
    {
      name: 'BwDiagrid',
      family: '"BwDiagrid", sans-serif',
      faces: [
        { weight: 400, file: 'BwDiagrid-Regular.f23841f.woff2', format: 'woff2' },
        { weight: 500, file: 'BwDiagrid-Regular.f23841f.woff2', format: 'woff2' },
        { weight: 600, file: 'BwDiagrid-Regular.f23841f.woff2', format: 'woff2' },
        { weight: 700, file: 'BwDiagrid-Regular.f23841f.woff2', format: 'woff2' }
      ]
    }
  ];

  function injectFontFaces() {
    if (document.querySelector('#theme-custom-fonts')) return;
    const style = document.createElement('style');
    style.id = 'theme-custom-fonts';
    style.textContent = FONTS.flatMap(font =>
      font.faces.map(face => {
        const cleanName = font.name;
        const url = `${FONT_BASE}/${face.file.split('/').map(encodeURIComponent).join('/')}`;
        return `@font-face { font-family: "${cleanName}"; src: url("${url}") format("${face.format}"); font-weight: ${face.weight}; font-style: normal; font-display: swap; }`;
      })
    ).join('\n');
    document.head.appendChild(style);
  }

  function applyPalette(palette) {
    const root = document.documentElement.style;
    root.setProperty('--theme-sidebar', palette.sidebar);
    root.setProperty('--theme-sidebar-text', palette.sidebarText);
    root.setProperty('--theme-sidebar-muted', palette.sidebarMuted);
    root.setProperty('--theme-sidebar-active', palette.sidebarActive);
    root.setProperty('--theme-sidebar-active-text', palette.sidebarActiveText);
    root.setProperty('--theme-bg', palette.bg);
    root.setProperty('--theme-surface', palette.surface);
    root.setProperty('--theme-surface-alt', palette.surfaceAlt);
    root.setProperty('--theme-border', palette.border);
    root.setProperty('--theme-text', palette.text);
    root.setProperty('--theme-muted', palette.muted);
    root.setProperty('--theme-accent', palette.accent);
    root.setProperty('--theme-accent-hover', palette.accentHover);
    root.setProperty('--theme-accent-text', palette.accentText);
    root.setProperty('--theme-accent-soft', palette.accentSoft);
    root.setProperty('--theme-accent-soft-hover', palette.accentSoftHover);
    root.setProperty('--theme-accent-soft-text', palette.accentSoftText);
  }

  function applyFont(font) {
    document.documentElement.style.setProperty('--theme-font', font.family);
  }

  let paletteIndex = 0;
  let fontIndex = 0;
  try {
    const savedPalette = localStorage.getItem(PALETTE_KEY);
    if (savedPalette) {
      const found = PALETTES.findIndex(p => p.name === savedPalette);
      if (found >= 0) paletteIndex = found;
    }
    const savedFont = localStorage.getItem(FONT_KEY);
    if (savedFont) {
      const found = FONTS.findIndex(f => f.name === savedFont);
      if (found >= 0) fontIndex = found;
    }
  } catch { /* ignore storage errors */ }

  injectFontFaces();
  applyPalette(PALETTES[paletteIndex]);
  applyFont(FONTS[fontIndex]);

  function mountControls() {
    if (document.querySelector('#theme-controls-dock')) return;
    const dock = document.createElement('div');
    dock.id = 'theme-controls-dock';
    dock.className = 'theme-controls-dock';

    const fontBtn = document.createElement('button');
    fontBtn.type = 'button';
    fontBtn.id = 'theme-font-btn';
    fontBtn.className = 'theme-dock-btn is-font';
    fontBtn.innerHTML = `<span data-font-label>Font: ${FONTS[fontIndex].name}</span>`;
    fontBtn.addEventListener('click', () => {
      fontIndex = (fontIndex + 1) % FONTS.length;
      const font = FONTS[fontIndex];
      applyFont(font);
      try { localStorage.setItem(FONT_KEY, font.name); } catch { /* ignore */ }
      fontBtn.querySelector('[data-font-label]').textContent = `Font: ${font.name}`;
    });

    const colorBtn = document.createElement('button');
    colorBtn.type = 'button';
    colorBtn.id = 'theme-randomize-btn';
    colorBtn.className = 'theme-dock-btn theme-randomize-btn';
    colorBtn.innerHTML = `<span class="theme-randomize-swatch" aria-hidden="true"></span><span data-palette-label>Colors: ${PALETTES[paletteIndex].name}</span>`;
    colorBtn.addEventListener('click', () => {
      let next = Math.floor(Math.random() * PALETTES.length);
      if (PALETTES.length > 1 && next === paletteIndex) {
        next = (paletteIndex + 1) % PALETTES.length;
      }
      paletteIndex = next;
      const palette = PALETTES[paletteIndex];
      applyPalette(palette);
      try { localStorage.setItem(PALETTE_KEY, palette.name); } catch { /* ignore */ }
      colorBtn.querySelector('[data-palette-label]').textContent = `Colors: ${palette.name}`;
    });

    dock.append(fontBtn, colorBtn);
    document.body.appendChild(dock);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountControls);
  } else {
    mountControls();
  }
})();
