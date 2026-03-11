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

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-use-before-define, jsx-a11y/label-has-associated-control, jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus, jsx-a11y/role-has-required-aria-props, react/button-has-type, react/display-name, react/no-array-index-key, no-underscore-dangle, no-plusplus */

import generateOnlyOfficeConfig from './generateOnlyOfficeConfig';

const createDefaultProps = (overrides: Record<string, any> = {}) => ({
  fileType: 'docx',
  type: 'desktop' as const,
  editorType: { id: 'word', key: 'abc123', documentType: 'word' },
  documentTitle: 'Test Document',
  documentUrl: 'https://example.com/doc.docx',
  callbackUrl: 'https://example.com/callback',
  mode: 'edit' as const,
  username: 'testuser',
  lang: 'en',
  uiTheme: 'theme-white' as const,
  ...overrides,
});

describe('generateOnlyOfficeConfig', () => {
  it('returns correct document properties', () => {
    const props = createDefaultProps();
    const config = generateOnlyOfficeConfig(props);

    expect(config.document).toEqual({
      fileType: 'docx',
      key: 'abc123',
      title: 'Test Document',
      url: 'https://example.com/doc.docx',
    });
  });

  it('sets zoom to 50 for view mode', () => {
    const props = createDefaultProps({ mode: 'view' });
    const config = generateOnlyOfficeConfig(props);

    expect((config.editorConfig as any).customization.zoom).toBe(50);
  });

  it('sets zoom to 100 for edit mode', () => {
    const props = createDefaultProps({ mode: 'edit' });
    const config = generateOnlyOfficeConfig(props);

    expect((config.editorConfig as any).customization.zoom).toBe(100);
  });

  it('sets empty token', () => {
    const props = createDefaultProps();
    const config = generateOnlyOfficeConfig(props);

    expect(config.token).toBe('');
  });

  it('sets correct height and width to 100%', () => {
    const props = createDefaultProps();
    const config = generateOnlyOfficeConfig(props);

    expect(config.height).toBe('100%');
    expect(config.width).toBe('100%');
  });

  it('passes through lang', () => {
    const props = createDefaultProps({ lang: 'de' });
    const config = generateOnlyOfficeConfig(props);

    expect((config.editorConfig as any).lang).toBe('de');
  });

  it('passes through type', () => {
    const props = createDefaultProps({ type: 'mobile' });
    const config = generateOnlyOfficeConfig(props);

    expect(config.type).toBe('mobile');
  });

  it('passes through documentType from editorType', () => {
    const props = createDefaultProps({
      editorType: { id: 'spreadsheet', key: 'xyz789', documentType: 'cell' },
    });
    const config = generateOnlyOfficeConfig(props);

    expect(config.documentType).toBe('cell');
  });

  it('passes through uiTheme', () => {
    const props = createDefaultProps({ uiTheme: 'theme-night' });
    const config = generateOnlyOfficeConfig(props);

    expect((config.editorConfig as any).customization.uiTheme).toBe('theme-night');
  });

  it('sets callbackUrl and mode in editorConfig', () => {
    const props = createDefaultProps();
    const config = generateOnlyOfficeConfig(props);

    expect((config.editorConfig as any).callbackUrl).toBe('https://example.com/callback');
    expect((config.editorConfig as any).mode).toBe('edit');
  });
});
