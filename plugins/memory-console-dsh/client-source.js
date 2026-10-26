const React = require('react');
const PANEL_ID = 'memory-console';
const COLOR_SOURCE = 'memory-console-dsh.kylin-preview';
const PALETTE = {
  '--dsw-alias-brand-primary': { light: '#2167b0', dark: '#7db7ef' },
  '--dsw-alias-button-primary-fill': { light: '#2167b0', dark: '#347fca' },
  '--dsw-alias-interactive-bg-active': { light: '#dceafa', dark: '#1c3b60' },
  '--dsw-specific-sidebar-fill': { light: '#e9eef5', dark: '#19283b' },
  '--dsw-alias-bg-base': { light: '#f7f9fc', dark: '#111b2a' },
};

function ConsoleIcon({ size }) {
  return React.createElement('span', {
    'aria-hidden': true,
    style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, fontSize: Math.max(15, Number(size) - 2) },
  }, '◈');
}

function ConsolePanel({ togglePalette, getPalette }) {
  const [enabled, setEnabled] = React.useState(getPalette);
  const h = React.createElement;
  return h('section', { style: { display: 'flex', flexDirection: 'column', width: '100%', height: '100%', minHeight: 0, background: 'var(--dsw-alias-bg-base)' } },
    h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--dsw-alias-border-l2)', fontFamily: 'system-ui, sans-serif' } },
      h('div', null,
        h('strong', { style: { color: 'var(--dsw-alias-brand-primary)' } }, 'Memory Console'),
        h('span', { style: { marginLeft: 12, fontSize: 12, opacity: .7 } }, '本地演示 · 数据边界见页面标注')),
      h('button', {
        type: 'button',
        'aria-pressed': enabled,
        onClick: () => setEnabled(togglePalette()),
        style: { border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 6, background: 'var(--dsw-alias-bg-layer-1)', color: 'inherit', padding: '6px 10px', cursor: 'pointer' },
      }, enabled ? '关闭麒麟风格预览' : '开启麒麟风格预览')),
    h('iframe', {
      title: 'Memory Console 演示',
      srcDoc: CONSOLE_HTML,
      sandbox: 'allow-scripts allow-downloads',
      style: { width: '100%', flex: 1, minHeight: 0, border: 0, background: '#fff' },
    }));
}

exports.inject = ['slots', 'theme'];
exports.apply = function apply(ctx) {
  let releasePalette;
  ctx.effect(() => () => { if (releasePalette) releasePalette(); }, 'memory-console: palette cleanup');
  const togglePalette = () => {
    if (releasePalette) { releasePalette(); releasePalette = undefined; }
    else releasePalette = ctx.theme.overrideTokens(COLOR_SOURCE, PALETTE);
    return Boolean(releasePalette);
  };
  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main', key: PANEL_ID,
    inject: () => ({ togglePalette, getPalette: () => Boolean(releasePalette) }),
  }, ConsolePanel));
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist', id: PANEL_ID, order: 10, label: () => '记忆控制台',
  }, ConsoleIcon));
};
