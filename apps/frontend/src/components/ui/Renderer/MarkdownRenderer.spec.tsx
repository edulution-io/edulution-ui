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
vi.mock('remark-gfm', () => ({ default: {} }));
vi.mock('rehype-highlight', () => ({ default: {} }));
vi.mock('@/components/ui/Renderer/markdownComponents', () => ({
  default: {},
}));
vi.mock('@/components/ui/Renderer/MarkdownRenderer.css', () => ({}));

let mockTheme = 'light';
vi.mock('@/store/useThemeStore', () => ({
  default: (selector: any) => selector({ theme: mockTheme }),
}));

let lastEditorProps: any = {};
let lastMarkdownProps: any = {};

vi.mock('@uiw/react-md-editor', () => {
  const Markdown = (props: any) => {
    lastMarkdownProps = props;
    return <div data-testid="md-preview">{props.source}</div>;
  };
  const MDEditor = (props: any) => {
    lastEditorProps = props;
    return (
      <div data-testid="md-editor">
        <textarea
          data-testid="md-editor-textarea"
          value={props.value}
          onChange={(e) => props.onChange?.(e.target.value)}
        />
      </div>
    );
  };
  MDEditor.Markdown = Markdown;
  return { default: MDEditor, PreviewType: {} };
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MarkdownRenderer from './MarkdownRenderer';

describe('MarkdownRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = 'light';
    lastEditorProps = {};
    lastMarkdownProps = {};
  });

  it('renders markdown preview when editable is false', () => {
    render(<MarkdownRenderer content="# Hello" />);
    expect(screen.getByTestId('md-preview')).toHaveTextContent('# Hello');
    expect(screen.queryByTestId('md-editor')).not.toBeInTheDocument();
  });

  it('renders editor when editable is true', () => {
    render(
      <MarkdownRenderer
        content="# Hello"
        editable
      />,
    );
    expect(screen.getByTestId('md-editor')).toBeInTheDocument();
    expect(screen.queryByTestId('md-preview')).not.toBeInTheDocument();
  });

  it('calls onChange when editor content changes', () => {
    const onChange = vi.fn();
    render(
      <MarkdownRenderer
        content="# Hello"
        editable
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByTestId('md-editor-textarea'), { target: { value: '# Updated' } });
    expect(onChange).toHaveBeenCalledWith('# Updated');
  });

  it('applies data-color-mode from theme store', () => {
    mockTheme = 'dark';
    const { container } = render(<MarkdownRenderer content="test" />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveAttribute('data-color-mode', 'dark');
  });

  it('applies contentId to wrapper div in preview mode', () => {
    render(
      <MarkdownRenderer
        content="test"
        contentId="my-content"
      />,
    );
    const wrapper = screen.getByTestId('md-preview').parentElement;
    expect(wrapper).toHaveAttribute('id', 'my-content');
  });
});
