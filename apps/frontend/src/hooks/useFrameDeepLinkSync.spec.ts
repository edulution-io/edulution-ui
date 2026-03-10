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

const { mockCombineUrlParts, mockGetSubPathFromBrowserUrl } = vi.hoisted(() => ({
  mockCombineUrlParts: vi.fn().mockReturnValue('/sub/path'),
  mockGetSubPathFromBrowserUrl: vi.fn().mockReturnValue({ subPath: '/sub/path', search: '', hash: '' }),
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/testapp/sub/path', search: '', hash: '' }),
  useNavigate: () => vi.fn(),
}));

vi.mock('@libs/common/utils', () => ({
  combineUrlParts: mockCombineUrlParts,
  getSubPathFromBrowserUrl: mockGetSubPathFromBrowserUrl,
  getSubPathFromIframe: vi.fn().mockReturnValue(null),
  isSameOrigin: vi.fn().mockReturnValue(false),
}));

vi.mock('@libs/common/constants/urlSyncPollingIntervalMs', () => ({
  default: 500,
}));

import { renderHook } from '@testing-library/react';
import useFrameDeepLinkSync from './useFrameDeepLinkSync';

const createIframeRef = () => ({
  current: document.createElement('iframe'),
});

const defaultOptions = {
  appName: 'testapp',
  iframeRef: createIframeRef() as React.RefObject<HTMLIFrameElement>,
  isFrameLoaded: false,
  isActiveFrame: false,
  urlSyncEnabled: true,
  preloadBasePage: false,
  pathname: '/testapp/sub/path',
  search: '',
  hash: '',
  getDeepLinkUrl: (suffix: string) => `https://example.com${suffix}`,
};

describe('useFrameDeepLinkSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCombineUrlParts.mockReturnValue('/sub/path');
    mockGetSubPathFromBrowserUrl.mockReturnValue({ subPath: '/sub/path', search: '', hash: '' });
  });

  it('returns deepLinkUrl when preloadBasePage is false and on app route', () => {
    const { result } = renderHook(() => useFrameDeepLinkSync(defaultOptions));

    expect(result.current.deepLinkUrl).toBe('https://example.com/sub/path');
  });

  it('returns null deepLinkUrl when preloadBasePage is true', () => {
    const { result } = renderHook(() =>
      useFrameDeepLinkSync({
        ...defaultOptions,
        preloadBasePage: true,
      }),
    );

    expect(result.current.deepLinkUrl).toBeNull();
  });

  it('returns null deepLinkUrl when not on app route', () => {
    const { result } = renderHook(() =>
      useFrameDeepLinkSync({
        ...defaultOptions,
        pathname: '/otherapp/page',
      }),
    );

    expect(result.current.deepLinkUrl).toBeNull();
  });

  it('returns deepLinkRefs with initial values', () => {
    const { result } = renderHook(() => useFrameDeepLinkSync(defaultOptions));

    expect(result.current.deepLinkRefs.current).toBeDefined();
    expect(result.current.deepLinkRefs.current.hasNavigatedToDeepLink).toBe(false);
  });

  it('stores initialBrowserUrlSuffix in deepLinkRefs', () => {
    const { result } = renderHook(() => useFrameDeepLinkSync(defaultOptions));

    expect(result.current.deepLinkRefs.current.initialBrowserUrlSuffix).toBe('/sub/path');
  });

  it('returns null deepLinkUrl when browserUrlSuffix is empty', () => {
    mockCombineUrlParts.mockReturnValue('');

    const { result } = renderHook(() => useFrameDeepLinkSync(defaultOptions));

    expect(result.current.deepLinkUrl).toBeNull();
  });

  it('handles empty pathname correctly', () => {
    const { result } = renderHook(() =>
      useFrameDeepLinkSync({
        ...defaultOptions,
        pathname: '/',
      }),
    );

    expect(result.current.deepLinkUrl).toBeNull();
  });
});
