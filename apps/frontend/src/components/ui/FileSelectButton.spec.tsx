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

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileSelectButton from './FileSelectButton';

describe('FileSelectButton', () => {
  const defaultProps = {
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the hidden file input', () => {
    render(<FileSelectButton {...defaultProps} />);
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
  });

  it('renders the label', () => {
    render(
      <FileSelectButton
        {...defaultProps}
        chooseText="Choose File"
      />,
    );
    expect(screen.getByText('Choose File')).toBeInTheDocument();
  });

  it('shows chooseText when hasSelection is false', () => {
    render(
      <FileSelectButton
        {...defaultProps}
        chooseText="Choose"
        changeText="Change"
        hasSelection={false}
      />,
    );
    expect(screen.getByText('Choose')).toBeInTheDocument();
  });

  it('shows changeText when hasSelection is true', () => {
    render(
      <FileSelectButton
        {...defaultProps}
        chooseText="Choose"
        changeText="Change"
        hasSelection
      />,
    );
    expect(screen.getByText('Change')).toBeInTheDocument();
  });

  it('applies default accept of image/*', () => {
    render(<FileSelectButton {...defaultProps} />);
    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', 'image/*');
  });

  it('applies custom accept', () => {
    render(
      <FileSelectButton
        {...defaultProps}
        accept=".pdf"
      />,
    );
    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', '.pdf');
  });

  it('supports multiple file selection', () => {
    render(
      <FileSelectButton
        {...defaultProps}
        multiple
      />,
    );
    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('multiple');
  });

  it('disables the input when disabled', () => {
    render(
      <FileSelectButton
        {...defaultProps}
        disabled
      />,
    );
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeDisabled();
  });

  it('applies disabled styling to the label', () => {
    render(
      <FileSelectButton
        {...defaultProps}
        disabled
        chooseText="Choose"
      />,
    );
    const label = screen.getByText('Choose');
    expect(label.className).toContain('cursor-not-allowed');
    expect(label.className).toContain('opacity-50');
  });

  it('applies custom labelClassName', () => {
    render(
      <FileSelectButton
        {...defaultProps}
        labelClassName="extra-label"
        chooseText="Choose"
      />,
    );
    const label = screen.getByText('Choose');
    expect(label.className).toContain('extra-label');
  });

  it('calls onChange when a file is selected', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <FileSelectButton
        {...defaultProps}
        onChange={handleChange}
      />,
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    await user.upload(input, file);
    expect(handleChange).toHaveBeenCalled();
  });

  it('links label to input via htmlFor', () => {
    render(
      <FileSelectButton
        {...defaultProps}
        inputId="custom-id"
        chooseText="Choose"
      />,
    );
    const input = document.querySelector('input[type="file"]');
    const label = screen.getByText('Choose');
    expect(input).toHaveAttribute('id', 'custom-id');
    expect(label).toHaveAttribute('for', 'custom-id');
  });
});
