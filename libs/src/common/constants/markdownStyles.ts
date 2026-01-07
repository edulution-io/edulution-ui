/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

interface PrintStyle {
  [key: string]: string;
}

interface MarkdownStyleEntry {
  tailwind: string;
  print: PrintStyle;
}

const MARKDOWN_STYLE_KEYS = [
  'h1',
  'h2',
  'h3',
  'p',
  'ul',
  'ol',
  'li',
  'codeInline',
  'codeBlock',
  'pre',
  'tableWrapper',
  'table',
  'thead',
  'tr',
  'th',
  'td',
  'a',
  'blockquote',
  'hr',
  'strong',
  'em',
] as const;

type MarkdownStyleKey = (typeof MARKDOWN_STYLE_KEYS)[number];

const MARKDOWN_STYLES: Record<MarkdownStyleKey, MarkdownStyleEntry> = {
  h1: {
    tailwind: 'mb-4 text-2xl font-bold',
    print: { fontSize: '24pt', marginBottom: '12pt', fontWeight: 'bold', pageBreakAfter: 'avoid' },
  },
  h2: {
    tailwind: 'mb-3 mt-6 text-xl font-bold',
    print: { fontSize: '18pt', marginTop: '18pt', marginBottom: '9pt', fontWeight: 'bold', pageBreakAfter: 'avoid' },
  },
  h3: {
    tailwind: 'mb-2 mt-4 text-lg font-semibold',
    print: { fontSize: '14pt', marginTop: '14pt', marginBottom: '7pt', fontWeight: '600', pageBreakAfter: 'avoid' },
  },
  p: {
    tailwind: 'mb-4 leading-relaxed',
    print: { marginBottom: '12pt', orphans: '3', widows: '3' },
  },
  ul: {
    tailwind: 'mb-4 ml-6 list-disc space-y-1',
    print: { marginBottom: '12pt', paddingLeft: '20pt' },
  },
  ol: {
    tailwind: 'mb-4 ml-6 list-decimal space-y-1',
    print: { marginBottom: '12pt', paddingLeft: '20pt' },
  },
  li: {
    tailwind: 'leading-relaxed',
    print: { marginBottom: '4pt' },
  },
  codeInline: {
    tailwind: 'bg-background/20 rounded px-1.5 py-0.5 font-mono text-sm',
    print: { fontFamily: "'Courier New', Courier, monospace", fontSize: '10pt', padding: '2pt 4pt' },
  },
  codeBlock: {
    tailwind: 'bg-background/20 block overflow-x-auto rounded-lg p-4 font-mono text-sm',
    print: {
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: '10pt',
      backgroundColor: '#f5f5f5',
      border: '1px solid #ddd',
      borderRadius: '4px',
    },
  },
  pre: {
    tailwind: 'bg-background/20 mb-4 overflow-x-auto rounded-lg p-4',
    print: {
      padding: '12pt',
      pageBreakInside: 'avoid',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      backgroundColor: '#f5f5f5',
      border: '1px solid #ddd',
      borderRadius: '4px',
    },
  },
  tableWrapper: {
    tailwind: 'mb-4 overflow-x-auto',
    print: {},
  },
  table: {
    tailwind: 'min-w-full border-collapse',
    print: { width: '100%', borderCollapse: 'collapse', marginBottom: '12pt', pageBreakInside: 'avoid' },
  },
  thead: {
    tailwind: 'bg-background/10',
    print: { backgroundColor: '#f0f0f0' },
  },
  tr: {
    tailwind: 'border-background/20 border-b',
    print: {},
  },
  th: {
    tailwind: 'border-background/30 border px-4 py-2 text-left font-semibold',
    print: { border: '1px solid #000', padding: '6pt 8pt', textAlign: 'left', fontWeight: 'bold' },
  },
  td: {
    tailwind: 'border-background/30 border px-4 py-2',
    print: { border: '1px solid #000', padding: '6pt 8pt', textAlign: 'left' },
  },
  a: {
    tailwind: 'text-primary underline hover:no-underline',
    print: { color: '#000', textDecoration: 'underline' },
  },
  blockquote: {
    tailwind: 'mb-4 border-l-4 border-primary pl-4 italic',
    print: { margin: '12pt 0', paddingLeft: '12pt', borderLeft: '3pt solid #666', fontStyle: 'italic' },
  },
  hr: {
    tailwind: 'border-background/30 my-6',
    print: { border: 'none', borderTop: '1px solid #000', margin: '18pt 0' },
  },
  strong: {
    tailwind: 'font-bold',
    print: { fontWeight: 'bold' },
  },
  em: {
    tailwind: 'italic',
    print: { fontStyle: 'italic' },
  },
};

const formatCSSProperty = (key: string): string => key.replace(/([A-Z])/g, '-$1').toLowerCase();

const generateElementCSS = (selector: string, styles: PrintStyle): string => {
  const cssProperties = Object.entries(styles)
    .map(([key, value]) => `${formatCSSProperty(key)}: ${value};`)
    .join(' ');
  return cssProperties ? `${selector} { ${cssProperties} }` : '';
};

export const generatePrintCSS = (): string => {
  const baseStyles = `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 20mm;
    }

    body > pre {
      font-family: 'Courier New', Courier, monospace;
      font-size: 10pt;
      line-height: 1.4;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin: 0;
      padding: 0;
      border: none;
      background: none;
    }

    pre code { padding: 0; border: none; background: none; }

    a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 9pt; }

    img { max-width: 100%; height: auto; page-break-inside: avoid; }
  `;

  const elementStyles = [
    generateElementCSS('h1', MARKDOWN_STYLES.h1.print),
    generateElementCSS('h2', MARKDOWN_STYLES.h2.print),
    generateElementCSS('h3', MARKDOWN_STYLES.h3.print),
    generateElementCSS('p', MARKDOWN_STYLES.p.print),
    generateElementCSS('ul, ol', MARKDOWN_STYLES.ul.print),
    generateElementCSS('li', MARKDOWN_STYLES.li.print),
    generateElementCSS('pre, code', {
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: '10pt',
      backgroundColor: '#f5f5f5',
      border: '1px solid #ddd',
      borderRadius: '4px',
    }),
    generateElementCSS('pre', MARKDOWN_STYLES.pre.print),
    generateElementCSS('code', MARKDOWN_STYLES.codeInline.print),
    generateElementCSS('table', MARKDOWN_STYLES.table.print),
    generateElementCSS('thead', MARKDOWN_STYLES.thead.print),
    generateElementCSS('th', MARKDOWN_STYLES.th.print),
    generateElementCSS('td', MARKDOWN_STYLES.td.print),
    generateElementCSS('a', MARKDOWN_STYLES.a.print),
    generateElementCSS('blockquote', MARKDOWN_STYLES.blockquote.print),
    generateElementCSS('hr', MARKDOWN_STYLES.hr.print),
    generateElementCSS('strong', MARKDOWN_STYLES.strong.print),
    generateElementCSS('em', MARKDOWN_STYLES.em.print),
  ].join('\n    ');

  return `@media print {
    ${baseStyles}
    ${elementStyles}
  }`;
};

export default MARKDOWN_STYLES;
