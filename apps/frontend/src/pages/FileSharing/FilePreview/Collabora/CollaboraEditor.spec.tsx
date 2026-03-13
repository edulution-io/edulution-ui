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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui/Loading/CircleLoader', () => ({
  default: () => <div data-testid="circle-loader" />,
}));

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: unknown[]) =>
    args
      .flatMap((arg) => {
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'object' && arg !== null) {
          return Object.entries(arg)
            .filter(([, v]) => v)
            .map(([k]) => k);
        }
        return [];
      })
      .join(' '),
}));

vi.mock('@libs/ui/constants/iframeAllowedConfig', () => ({
  default: 'clipboard-read; clipboard-write',
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CollaboraEditor from './CollaboraEditor';

const defaultProps = {
  collaboraUrl: 'https://collabora.example.com',
  wopiSrc: 'https://app.example.com/edu-api/wopi/files/abc123',
  accessToken: 'wopi-token-123',
  accessTokenTTL: 86400000,
  editorPath: '/browser/abc/cool.html',
};

describe('CollaboraEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a form with correct action URL', () => {
    render(<CollaboraEditor {...defaultProps} />);

    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();

    const expectedAction =
      'https://collabora.example.com/browser/abc/cool.html?WOPISrc=https%3A%2F%2Fapp.example.com%2Fedu-api%2Fwopi%2Ffiles%2Fabc123&permission=readonly';
    expect(form?.getAttribute('action')).toBe(expectedAction);
    expect(form?.getAttribute('method')).toBe('POST');
    expect(form?.getAttribute('target')).toBe('collabora-frame');
  });

  it('renders hidden inputs with access token and TTL', () => {
    render(<CollaboraEditor {...defaultProps} />);

    const tokenInput = document.querySelector('input[name="access_token"]') as HTMLInputElement;
    const ttlInput = document.querySelector('input[name="access_token_ttl"]') as HTMLInputElement;

    expect(tokenInput).toBeInTheDocument();
    expect(tokenInput.value).toBe('wopi-token-123');
    expect(tokenInput.type).toBe('hidden');

    expect(ttlInput).toBeInTheDocument();
    expect(ttlInput.value).toBe('86400000');
    expect(ttlInput.type).toBe('hidden');
  });

  it('renders an iframe with correct attributes', () => {
    render(<CollaboraEditor {...defaultProps} />);

    const iframe = document.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe?.getAttribute('name')).toBe('collabora-frame');
    expect(iframe?.getAttribute('title')).toBe('filesharing.collaboraEditor');
    expect(iframe?.getAttribute('allow')).toBe('clipboard-read; clipboard-write');
  });

  it('shows loading spinner initially', () => {
    render(<CollaboraEditor {...defaultProps} />);

    expect(screen.getByTestId('circle-loader')).toBeInTheDocument();
  });

  it('uses edit permission when editMode is true', () => {
    render(
      <CollaboraEditor
        {...defaultProps}
        editMode
      />,
    );

    const form = document.querySelector('form');
    expect(form?.getAttribute('action')).toContain('permission=edit');
  });

  it('uses readonly permission when editMode is false', () => {
    render(
      <CollaboraEditor
        {...defaultProps}
        editMode={false}
      />,
    );

    const form = document.querySelector('form');
    expect(form?.getAttribute('action')).toContain('permission=readonly');
  });

  it('submits form after cleanup delay', () => {
    render(<CollaboraEditor {...defaultProps} />);

    const form = document.querySelector('form') as HTMLFormElement;
    const submitSpy = vi.spyOn(form, 'submit').mockImplementation(() => {});

    vi.advanceTimersByTime(250);

    expect(submitSpy).toHaveBeenCalled();
  });

  it('hides loading spinner after iframe loads following form submission', () => {
    render(<CollaboraEditor {...defaultProps} />);

    const form = document.querySelector('form') as HTMLFormElement;
    vi.spyOn(form, 'submit').mockImplementation(() => {});
    vi.advanceTimersByTime(250);

    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    fireEvent.load(iframe);

    expect(screen.queryByTestId('circle-loader')).not.toBeInTheDocument();
  });

  it('does not hide loading spinner on iframe load before form submission', () => {
    render(<CollaboraEditor {...defaultProps} />);

    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    fireEvent.load(iframe);

    expect(screen.getByTestId('circle-loader')).toBeInTheDocument();
  });

  it('applies h-dvh class when isOpenedInNewTab is true', () => {
    const { container } = render(
      <CollaboraEditor
        {...defaultProps}
        isOpenedInNewTab
      />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('h-dvh');
  });

  it('does not apply h-dvh class when isOpenedInNewTab is false', () => {
    const { container } = render(
      <CollaboraEditor
        {...defaultProps}
        isOpenedInNewTab={false}
      />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).not.toContain('h-dvh');
  });
});
