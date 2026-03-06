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

const { mockNavigate, locationState, mockIsSameOrigin, mockGetSubPathFromIframe, mockGetSubPathFromBrowserUrl } =
  vi.hoisted(() => ({
    mockNavigate: vi.fn(),
    locationState: { pathname: '/testapp/page', search: '', hash: '' },
    mockIsSameOrigin: vi.fn().mockReturnValue(true),
    mockGetSubPathFromIframe: vi.fn().mockReturnValue({ subPath: '/page', search: '', hash: '' }),
    mockGetSubPathFromBrowserUrl: vi.fn().mockReturnValue({ subPath: '/page', search: '', hash: '' }),
  }));

vi.mock('react-router-dom', () => ({
  useLocation: () => locationState,
  useNavigate: () => mockNavigate,
}));

vi.mock('@libs/common/utils', () => ({
  getSubPathFromBrowserUrl: mockGetSubPathFromBrowserUrl,
  getSubPathFromIframe: mockGetSubPathFromIframe,
  isSameOrigin: mockIsSameOrigin,
}));

vi.mock('@libs/common/constants/urlSyncPollingIntervalMs', () => ({
  default: 500,
}));

import { renderHook } from '@testing-library/react';
import useFrameUrlSync from './useFrameUrlSync';

const createIframeRef = () => ({
  current: document.createElement('iframe'),
});

describe('useFrameUrlSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    locationState.pathname = '/testapp/page';
    locationState.search = '';
    locationState.hash = '';
    mockIsSameOrigin.mockReturnValue(true);
    mockGetSubPathFromIframe.mockReturnValue({ subPath: '/page', search: '', hash: '' });
    mockGetSubPathFromBrowserUrl.mockReturnValue({ subPath: '/page', search: '', hash: '' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not sync when disabled', () => {
    const iframeRef = createIframeRef();

    renderHook(() =>
      useFrameUrlSync({
        appName: 'testapp',
        iframeRef: iframeRef as React.RefObject<HTMLIFrameElement>,
        enabled: false,
      }),
    );

    vi.advanceTimersByTime(1000);

    expect(mockIsSameOrigin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does not sync when not on app route', () => {
    locationState.pathname = '/othertapp/page';
    const iframeRef = createIframeRef();

    renderHook(() =>
      useFrameUrlSync({
        appName: 'testapp',
        iframeRef: iframeRef as React.RefObject<HTMLIFrameElement>,
        enabled: true,
      }),
    );

    vi.advanceTimersByTime(1000);

    expect(mockIsSameOrigin).not.toHaveBeenCalled();
  });

  it('does not sync when iframeRef.current is null', () => {
    const iframeRef = { current: null };

    renderHook(() =>
      useFrameUrlSync({
        appName: 'testapp',
        iframeRef: iframeRef as React.RefObject<HTMLIFrameElement>,
        enabled: true,
      }),
    );

    vi.advanceTimersByTime(1000);

    expect(mockIsSameOrigin).not.toHaveBeenCalled();
  });

  it('does not navigate when iframe is not same origin', () => {
    mockIsSameOrigin.mockReturnValue(false);
    const iframeRef = createIframeRef();

    renderHook(() =>
      useFrameUrlSync({
        appName: 'testapp',
        iframeRef: iframeRef as React.RefObject<HTMLIFrameElement>,
        enabled: true,
      }),
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does not navigate when iframe and browser URLs match', () => {
    const iframeRef = createIframeRef();
    mockGetSubPathFromIframe.mockReturnValue({ subPath: '/page', search: '', hash: '' });
    mockGetSubPathFromBrowserUrl.mockReturnValue({ subPath: '/page', search: '', hash: '' });

    renderHook(() =>
      useFrameUrlSync({
        appName: 'testapp',
        iframeRef: iframeRef as React.RefObject<HTMLIFrameElement>,
        enabled: true,
      }),
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates when iframe URL differs from browser URL', () => {
    const iframeRef = createIframeRef();
    mockGetSubPathFromIframe.mockReturnValue({ subPath: '/new-page', search: '?q=1', hash: '#top' });
    mockGetSubPathFromBrowserUrl.mockReturnValue({ subPath: '/page', search: '', hash: '' });

    renderHook(() =>
      useFrameUrlSync({
        appName: 'testapp',
        iframeRef: iframeRef as React.RefObject<HTMLIFrameElement>,
        enabled: true,
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith('/testapp/new-page?q=1#top', { replace: true });
  });

  it('sets up polling interval and syncs periodically', () => {
    const iframeRef = createIframeRef();
    mockGetSubPathFromIframe.mockReturnValue({ subPath: '/page', search: '', hash: '' });
    mockGetSubPathFromBrowserUrl.mockReturnValue({ subPath: '/page', search: '', hash: '' });

    renderHook(() =>
      useFrameUrlSync({
        appName: 'testapp',
        iframeRef: iframeRef as React.RefObject<HTMLIFrameElement>,
        enabled: true,
      }),
    );

    expect(mockIsSameOrigin).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(500);

    expect(mockIsSameOrigin).toHaveBeenCalledTimes(2);
  });

  it('clears interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const iframeRef = createIframeRef();

    const { unmount } = renderHook(() =>
      useFrameUrlSync({
        appName: 'testapp',
        iframeRef: iframeRef as React.RefObject<HTMLIFrameElement>,
        enabled: true,
      }),
    );

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('returns null from getSubPathFromIframe and skips navigation', () => {
    const iframeRef = createIframeRef();
    mockGetSubPathFromIframe.mockReturnValue(null);

    renderHook(() =>
      useFrameUrlSync({
        appName: 'testapp',
        iframeRef: iframeRef as React.RefObject<HTMLIFrameElement>,
        enabled: true,
      }),
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
