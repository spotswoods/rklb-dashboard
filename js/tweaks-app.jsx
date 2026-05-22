// Tweaks panel for RKLB dashboard
const RKLB_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "palette": "eos",
  "density": "comfortable",
  "headerFont": "Inter",
  "chartFill": "solid",
  "showTicker": true
}/*EDITMODE-END*/;

function EoseTweaks() {
  const { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSelect, TweakToggle, TweakColor } = window;
  const [t, setTweak] = useTweaks(RKLB_TWEAK_DEFAULTS);

  // Apply tweaks to DOM
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', t.theme);
    document.body.style.setProperty('--density-pad', t.density === 'compact' ? '16px' : '24px');

    // palettes — only override --accent + --accent-line + --accent-soft + brand-cyan
    const palettes = {
      eos:    { accent: '#84D414', light: '#3D9B0E' },  // Eos brand lime
      forest: { accent: '#21D9A8', light: '#0F9C6F' },  // teal-green
      lime:   { accent: '#B8EA4A', light: '#4FB31E' },  // brighter lime
      cyan:   { accent: '#06D7E8', light: '#0AA8B8' },  // alt cyan
    };
    const p = palettes[t.palette] || palettes.eos;
    const root = document.documentElement.style;
    const accent = t.theme === 'dark' ? p.accent : p.light;
    root.setProperty('--brand-green', p.accent);
    root.setProperty('--accent', accent);
    root.setProperty('--positive', accent);
    root.setProperty('--accent-soft', accent + '24');
    root.setProperty('--accent-line', accent + '66');
    root.setProperty('--positive-soft', accent + '24');

    document.body.style.setProperty('--font-display',
      t.headerFont === 'Inter' ? '"Inter", sans-serif' :
      t.headerFont === 'Display' ? '"Space Grotesk", "Inter", sans-serif' :
      '"JetBrains Mono", monospace'
    );

    const ticker = document.querySelector('.ticker');
    if (ticker) ticker.style.display = t.showTicker ? '' : 'none';

    // re-render charts to pick up colors
    if (window.RKLB_APP) {
      setTimeout(() => window.RKLB_APP.renderAllCharts(), 50);
    }
  }, [t.theme, t.palette, t.density, t.headerFont, t.chartFill, t.showTicker]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Theme">
        <TweakRadio
          label="Mode"
          value={t.theme}
          onChange={v => setTweak('theme', v)}
          options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]}
        />
      </TweakSection>
      <TweakSection label="Palette">
        <TweakRadio
          label="Accent"
          value={t.palette}
          onChange={v => setTweak('palette', v)}
          options={[
            { value: 'eos', label: 'Eos' },
            { value: 'forest', label: 'Teal' },
            { value: 'lime', label: 'Lime' },
            { value: 'cyan', label: 'Cyan' }
          ]}
        />
      </TweakSection>
      <TweakSection label="Layout">
        <TweakRadio
          label="Density"
          value={t.density}
          onChange={v => setTweak('density', v)}
          options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]}
        />
        <TweakSelect
          label="Header font"
          value={t.headerFont}
          onChange={v => setTweak('headerFont', v)}
          options={[
            { value: 'Inter', label: 'Inter (default)' },
            { value: 'Display', label: 'Space Grotesk' },
            { value: 'Mono', label: 'JetBrains Mono' }
          ]}
        />
        <TweakToggle
          label="Show top ticker"
          value={t.showTicker}
          onChange={v => setTweak('showTicker', v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<EoseTweaks />);
