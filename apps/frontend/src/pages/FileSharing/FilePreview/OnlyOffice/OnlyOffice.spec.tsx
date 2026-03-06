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

const mockUseOnlyOffice = vi.fn();

vi.mock('@/pages/FileSharing/hooks/useOnlyOffice', () => ({
  default: (props: any) => mockUseOnlyOffice(props),
}));

vi.mock('@/pages/FileSharing/FilePreview/OnlyOffice/OnlyOfficeEditor', () => ({
  default: ({ documentServerURL, editorType, mode, editorConfig, filePath, fileName, isOpenedInNewTab }: any) => (
    <div data-testid="onlyoffice-editor">
      <span data-testid="editor-server-url">{documentServerURL}</span>
      <span data-testid="editor-type">{editorType}</span>
      <span data-testid="editor-mode">{mode}</span>
      <span data-testid="editor-filepath">{filePath}</span>
      <span data-testid="editor-filename">{fileName}</span>
      <span data-testid="editor-new-tab">{String(isOpenedInNewTab)}</span>
    </div>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import OnlyOffice from './OnlyOffice';

const defaultProps = {
  url: 'https://office.example.com',
  filePath: '/documents/test.docx',
  fileName: 'test.docx',
  mode: 'edit' as const,
  type: 'desktop' as const,
  isOpenedInNewTab: false,
  webdavShare: 'my-share',
};

describe('OnlyOffice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders editor when editorConfig is available', () => {
    mockUseOnlyOffice.mockReturnValue({
      documentServerURL: 'https://docs.example.com',
      editorType: 'desktop',
      editorConfig: { document: { title: 'test.docx' } },
    });

    render(<OnlyOffice {...defaultProps} />);

    expect(screen.getByTestId('onlyoffice-editor')).toBeInTheDocument();
  });

  it('does not render when editorConfig is null', () => {
    mockUseOnlyOffice.mockReturnValue({
      documentServerURL: 'https://docs.example.com',
      editorType: 'desktop',
      editorConfig: null,
    });

    render(<OnlyOffice {...defaultProps} />);

    expect(screen.queryByTestId('onlyoffice-editor')).not.toBeInTheDocument();
  });

  it('does not render when editorConfig is undefined', () => {
    mockUseOnlyOffice.mockReturnValue({
      documentServerURL: null,
      editorType: null,
      editorConfig: undefined,
    });

    render(<OnlyOffice {...defaultProps} />);

    expect(screen.queryByTestId('onlyoffice-editor')).not.toBeInTheDocument();
  });

  it('passes correct props to OnlyOfficeEditor', () => {
    mockUseOnlyOffice.mockReturnValue({
      documentServerURL: 'https://docs.example.com',
      editorType: 'desktop',
      editorConfig: { document: { title: 'test.docx' } },
    });

    render(<OnlyOffice {...defaultProps} />);

    expect(screen.getByTestId('editor-server-url')).toHaveTextContent('https://docs.example.com');
    expect(screen.getByTestId('editor-type')).toHaveTextContent('desktop');
    expect(screen.getByTestId('editor-mode')).toHaveTextContent('edit');
    expect(screen.getByTestId('editor-filepath')).toHaveTextContent('/documents/test.docx');
    expect(screen.getByTestId('editor-filename')).toHaveTextContent('test.docx');
    expect(screen.getByTestId('editor-new-tab')).toHaveTextContent('false');
  });

  it('passes empty string when documentServerURL is null', () => {
    mockUseOnlyOffice.mockReturnValue({
      documentServerURL: null,
      editorType: 'mobile',
      editorConfig: { document: { title: 'test.docx' } },
    });

    render(<OnlyOffice {...defaultProps} />);

    expect(screen.getByTestId('editor-server-url')).toHaveTextContent('');
  });

  it('passes correct props to useOnlyOffice hook', () => {
    mockUseOnlyOffice.mockReturnValue({
      documentServerURL: null,
      editorType: null,
      editorConfig: null,
    });

    render(<OnlyOffice {...defaultProps} />);

    expect(mockUseOnlyOffice).toHaveBeenCalledWith({
      filePath: '/documents/test.docx',
      fileName: 'test.docx',
      url: 'https://office.example.com',
      type: 'desktop',
      mode: 'edit',
      webdavShare: 'my-share',
    });
  });
});
