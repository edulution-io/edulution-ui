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

import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressTextArea from './ProgressTextArea';

describe('ProgressTextArea', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders joined text lines in the textarea', () => {
    render(<ProgressTextArea text={['Line 1', 'Line 2', 'Line 3']} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3');
  });

  it('renders empty textarea when text array is empty', () => {
    render(<ProgressTextArea text={[]} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('');
  });

  it('renders textarea as readOnly', () => {
    render(<ProgressTextArea text={['test']} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('readOnly');
  });

  it('uses common.progress as placeholder', () => {
    render(<ProgressTextArea text={[]} />);

    const textarea = screen.getByPlaceholderText('common.progress');
    expect(textarea).toBeInTheDocument();
  });

  it('renders a single text entry', () => {
    render(<ProgressTextArea text={['Single line']} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Single line');
  });
});
