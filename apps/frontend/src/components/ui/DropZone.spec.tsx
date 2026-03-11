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
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ className }: any) => (
    <span
      data-testid="fa-icon"
      className={className}
    />
  ),
}));

vi.mock('react-dropzone', () => ({
  useDropzone: (options: any) => ({
    getRootProps: (extra: any) => ({
      ...extra,
      'data-testid': 'dropzone-root',
      onClick: vi.fn(),
    }),
    getInputProps: () => ({
      'data-testid': 'dropzone-input',
    }),
    isDragActive: options._isDragActive ?? false,
  }),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import DropZone from './DropZone';

describe('DropZone', () => {
  it('renders the dropzone root', () => {
    render(<DropZone onDrop={vi.fn()} />);
    expect(screen.getByTestId('dropzone-root')).toBeInTheDocument();
  });

  it('renders the hidden file input', () => {
    render(<DropZone onDrop={vi.fn()} />);
    expect(screen.getByTestId('dropzone-input')).toBeInTheDocument();
  });

  it('renders the upload icon', () => {
    render(<DropZone onDrop={vi.fn()} />);
    expect(screen.getByTestId('fa-icon')).toBeInTheDocument();
  });

  it('shows default inactive text', () => {
    render(<DropZone onDrop={vi.fn()} />);
    expect(screen.getByText('filesharingUpload.dragDropClick')).toBeInTheDocument();
  });

  it('shows custom inactive text when provided', () => {
    render(
      <DropZone
        onDrop={vi.fn()}
        inactiveText="Upload your files"
      />,
    );
    expect(screen.getByText('Upload your files')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <DropZone
        onDrop={vi.fn()}
        className="custom-drop"
      />,
    );
    const root = screen.getByTestId('dropzone-root');
    expect(root.className).toContain('custom-drop');
  });
});
