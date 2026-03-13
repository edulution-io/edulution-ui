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

/* eslint-disable @typescript-eslint/no-explicit-any */

const mockUseCollabora = vi.fn();

vi.mock('@/pages/FileSharing/hooks/useCollabora', () => ({
  default: (props: any) => mockUseCollabora(props),
}));

vi.mock('@/pages/FileSharing/FilePreview/Collabora/CollaboraEditor', () => ({
  default: ({ collaboraUrl, wopiSrc, accessToken, accessTokenTTL, editorPath, editMode, isOpenedInNewTab }: any) => (
    <div data-testid="collabora-editor">
      <span data-testid="editor-collabora-url">{collaboraUrl}</span>
      <span data-testid="editor-wopi-src">{wopiSrc}</span>
      <span data-testid="editor-access-token">{accessToken}</span>
      <span data-testid="editor-access-token-ttl">{accessTokenTTL}</span>
      <span data-testid="editor-path">{editorPath}</span>
      <span data-testid="editor-edit-mode">{String(editMode)}</span>
      <span data-testid="editor-new-tab">{String(isOpenedInNewTab)}</span>
    </div>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import Collabora from './Collabora';

const fullHookResult = {
  collaboraUrl: 'https://collabora.example.com',
  wopiSrc: 'https://app.example.com/edu-api/wopi/files/abc123',
  accessToken: 'wopi-token',
  accessTokenTTL: 86400000,
  editorPath: '/browser/abc/cool.html',
  isLoading: false,
};

describe('Collabora', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders CollaboraEditor when all data is available', () => {
    mockUseCollabora.mockReturnValue(fullHookResult);

    render(<Collabora filePath="/docs/test.docx" />);

    expect(screen.getByTestId('collabora-editor')).toBeInTheDocument();
  });

  it('returns null when isLoading is true', () => {
    mockUseCollabora.mockReturnValue({ ...fullHookResult, isLoading: true });

    const { container } = render(<Collabora filePath="/docs/test.docx" />);

    expect(container.innerHTML).toBe('');
  });

  it('returns null when collaboraUrl is empty', () => {
    mockUseCollabora.mockReturnValue({ ...fullHookResult, collaboraUrl: '' });

    const { container } = render(<Collabora filePath="/docs/test.docx" />);

    expect(container.innerHTML).toBe('');
  });

  it('returns null when wopiSrc is empty', () => {
    mockUseCollabora.mockReturnValue({ ...fullHookResult, wopiSrc: '' });

    const { container } = render(<Collabora filePath="/docs/test.docx" />);

    expect(container.innerHTML).toBe('');
  });

  it('returns null when accessToken is empty', () => {
    mockUseCollabora.mockReturnValue({ ...fullHookResult, accessToken: '' });

    const { container } = render(<Collabora filePath="/docs/test.docx" />);

    expect(container.innerHTML).toBe('');
  });

  it('passes correct props to CollaboraEditor', () => {
    mockUseCollabora.mockReturnValue(fullHookResult);

    render(
      <Collabora
        filePath="/docs/test.docx"
        editMode
        isOpenedInNewTab
      />,
    );

    expect(screen.getByTestId('editor-collabora-url')).toHaveTextContent('https://collabora.example.com');
    expect(screen.getByTestId('editor-wopi-src')).toHaveTextContent(
      'https://app.example.com/edu-api/wopi/files/abc123',
    );
    expect(screen.getByTestId('editor-access-token')).toHaveTextContent('wopi-token');
    expect(screen.getByTestId('editor-access-token-ttl')).toHaveTextContent('86400000');
    expect(screen.getByTestId('editor-path')).toHaveTextContent('/browser/abc/cool.html');
    expect(screen.getByTestId('editor-edit-mode')).toHaveTextContent('true');
    expect(screen.getByTestId('editor-new-tab')).toHaveTextContent('true');
  });

  it('passes correct props to useCollabora hook', () => {
    mockUseCollabora.mockReturnValue(fullHookResult);

    render(
      <Collabora
        filePath="/docs/test.docx"
        webdavShare="my-share"
      />,
    );

    expect(mockUseCollabora).toHaveBeenCalledWith({
      filePath: '/docs/test.docx',
      webdavShare: 'my-share',
    });
  });

  it('passes editMode and isOpenedInNewTab as undefined when not provided', () => {
    mockUseCollabora.mockReturnValue(fullHookResult);

    render(<Collabora filePath="/docs/test.docx" />);

    expect(screen.getByTestId('editor-edit-mode')).toHaveTextContent('undefined');
    expect(screen.getByTestId('editor-new-tab')).toHaveTextContent('undefined');
  });
});
