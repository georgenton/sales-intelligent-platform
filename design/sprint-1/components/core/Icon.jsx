import React from 'react';

const DEFAULT_SVG = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const RENAME = { class: 'className', 'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin', 'fill-rule': 'fillRule', 'clip-rule': 'clipRule', 'stroke-dasharray': 'strokeDasharray' };

function reactAttrs(attrs) {
  const out = {};
  Object.keys(attrs || {}).forEach((k) => { out[RENAME[k] || k] = attrs[k]; });
  return out;
}

function toEl(node, key) {
  if (!Array.isArray(node)) return null;
  const [tag, attrs, children] = node;
  const kids = Array.isArray(children) ? children.map((c, i) => toEl(c, i)) : null;
  return React.createElement(tag, { key, ...reactAttrs(attrs) }, kids);
}

function lookup(name) {
  const l = typeof window !== 'undefined' ? window.lucide : null;
  if (!l) return null;
  const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  return (l.icons && (l.icons[name] || l.icons[kebab])) || l[name] || null;
}

/** Lucide glyph wrapper. Lucide 0.577 is the source repo's icon library. */
export function Icon({ name, size = 16, strokeWidth = 2, label, style, ...rest }) {
  const icon = lookup(name);
  const children = !icon ? [] : (typeof icon[0] === 'string' ? [icon] : icon).map((n, i) => toEl(n, i));
  const flat = children.length === 1 && children[0] && children[0].type === 'svg' ? children[0].props.children : children;
  return React.createElement(
    'svg',
    {
      ...DEFAULT_SVG,
      strokeWidth,
      width: size,
      height: size,
      'aria-hidden': label ? undefined : 'true',
      role: label ? 'img' : undefined,
      'aria-label': label,
      style: { display: 'block', flex: 'none', ...style },
      ...rest,
    },
    [label ? React.createElement('title', { key: 't' }, label) : null, flat],
  );
}
