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

import { renderHook } from '@testing-library/react';
import { type RefObject } from 'react';
import useFloatingBarHeight from './useFloatingBarHeight';

describe('useFloatingBarHeight', () => {
  let mockObserve: ReturnType<typeof vi.fn>;
  let mockDisconnect: ReturnType<typeof vi.fn>;
  let observerCallback: ResizeObserverCallback;

  beforeEach(() => {
    vi.clearAllMocks();
    mockObserve = vi.fn();
    mockDisconnect = vi.fn();

    vi.stubGlobal(
      'ResizeObserver',
      class MockResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          observerCallback = callback;
        }

        observe = mockObserve;

        disconnect = mockDisconnect;

        unobserve = vi.fn();
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.style.removeProperty('--floating-bar-h');
  });

  it('does nothing when ref.current is null', () => {
    const ref = { current: null } as RefObject<HTMLDivElement>;

    renderHook(() => useFloatingBarHeight(ref));

    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('sets the CSS variable on initial render', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientHeight', { value: 48, configurable: true });
    const ref = { current: el } as RefObject<HTMLDivElement>;

    renderHook(() => useFloatingBarHeight(ref));

    expect(document.documentElement.style.getPropertyValue('--floating-bar-h')).toBe('48px');
  });

  it('observes the element with ResizeObserver', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientHeight', { value: 48, configurable: true });
    const ref = { current: el } as RefObject<HTMLDivElement>;

    renderHook(() => useFloatingBarHeight(ref));

    expect(mockObserve).toHaveBeenCalledWith(el);
  });

  it('updates CSS variable immediately when height increases', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientHeight', { value: 48, configurable: true });
    const ref = { current: el } as RefObject<HTMLDivElement>;

    renderHook(() => useFloatingBarHeight(ref));

    expect(document.documentElement.style.getPropertyValue('--floating-bar-h')).toBe('48px');

    Object.defineProperty(el, 'clientHeight', { value: 64, configurable: true });
    observerCallback([] as ResizeObserverEntry[], {} as ResizeObserver);

    expect(document.documentElement.style.getPropertyValue('--floating-bar-h')).toBe('64px');
  });

  it('delays CSS variable update when height decreases', () => {
    vi.useFakeTimers();
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientHeight', { value: 64, configurable: true });
    const ref = { current: el } as RefObject<HTMLDivElement>;

    renderHook(() => useFloatingBarHeight(ref));

    expect(document.documentElement.style.getPropertyValue('--floating-bar-h')).toBe('64px');

    Object.defineProperty(el, 'clientHeight', { value: 32, configurable: true });
    observerCallback([] as ResizeObserverEntry[], {} as ResizeObserver);

    expect(document.documentElement.style.getPropertyValue('--floating-bar-h')).toBe('64px');

    vi.advanceTimersByTime(100);

    expect(document.documentElement.style.getPropertyValue('--floating-bar-h')).toBe('32px');
    vi.useRealTimers();
  });

  it('disconnects observer and removes listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientHeight', { value: 48, configurable: true });
    const ref = { current: el } as RefObject<HTMLDivElement>;

    const { unmount } = renderHook(() => useFloatingBarHeight(ref));
    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
