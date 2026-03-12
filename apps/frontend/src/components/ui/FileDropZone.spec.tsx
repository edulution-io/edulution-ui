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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) =>
    args
      .flatMap((a: any) => {
        if (typeof a === 'string') return a;
        if (a && typeof a === 'object')
          return Object.entries(a)
            .filter(([, v]) => v)
            .map(([k]) => k);
        return [];
      })
      .filter(Boolean)
      .join(' '),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: any) => <span data-testid="fa-icon" />,
}));

let mockIsDragActive = false;

vi.mock('react-dropzone', () => ({
  useDropzone: (options: any) => ({
    getRootProps: () => ({ 'data-testid': 'filedrop-root' }),
    getInputProps: () => ({ 'data-testid': 'filedrop-input' }),
    isDragActive: mockIsDragActive,
  }),
}));

vi.mock('@libs/filesharing/types/uploadItem', () => ({}));
vi.mock('@/pages/FileSharing/utilities/extractFilesFromDropEvent', () => ({
  default: vi.fn(),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import FileDropZone from './FileDropZone';

describe('FileDropZone', () => {
  beforeEach(() => {
    mockIsDragActive = false;
  });

  it('renders children and the hidden input', () => {
    render(
      <FileDropZone onFileDrop={vi.fn()}>
        <p>Files here</p>
      </FileDropZone>,
    );
    expect(screen.getByText('Files here')).toBeInTheDocument();
    expect(screen.getByTestId('filedrop-input')).toBeInTheDocument();
  });

  it('renders the root dropzone container', () => {
    render(
      <FileDropZone onFileDrop={vi.fn()}>
        <span>Content</span>
      </FileDropZone>,
    );
    expect(screen.getByTestId('filedrop-root')).toBeInTheDocument();
  });

  it('does not show drag overlay when not dragging', () => {
    render(
      <FileDropZone onFileDrop={vi.fn()}>
        <span>Content</span>
      </FileDropZone>,
    );
    expect(screen.queryByText('filesharingUpload.dropHere')).not.toBeInTheDocument();
  });

  it('shows drag overlay with icon when dragging is active', () => {
    mockIsDragActive = true;
    render(
      <FileDropZone onFileDrop={vi.fn()}>
        <span>Content</span>
      </FileDropZone>,
    );
    expect(screen.getByText('filesharingUpload.dropHere')).toBeInTheDocument();
    expect(screen.getByTestId('fa-icon')).toBeInTheDocument();
  });
});
