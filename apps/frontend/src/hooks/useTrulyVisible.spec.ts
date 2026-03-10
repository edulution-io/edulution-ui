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
import useTrulyVisible from './useTrulyVisible';

describe('useTrulyVisible', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    if (!document.elementFromPoint) {
      document.elementFromPoint = vi.fn().mockReturnValue(null);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when ref.current is null', () => {
    const ref = { current: null } as RefObject<HTMLElement>;

    const { result } = renderHook(() => useTrulyVisible(ref));

    expect(result.current).toBe(false);
  });

  it('returns false when element is outside viewport', () => {
    const el = document.createElement('div');
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      left: -100,
      top: -100,
      right: -50,
      bottom: -50,
      width: 50,
      height: 50,
      x: -100,
      y: -100,
      toJSON: () => {},
    });
    const ref = { current: el } as RefObject<HTMLElement>;

    const { result } = renderHook(() => useTrulyVisible(ref));

    expect(result.current).toBe(false);
  });

  it('returns true when element is in viewport and not occluded - tracks visibility changes', () => {
    const el = document.createElement('div');
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      top: 10,
      right: 100,
      bottom: 100,
      width: 90,
      height: 90,
      x: 10,
      y: 10,
      toJSON: () => {},
    });
    vi.spyOn(el, 'contains').mockReturnValue(true);
    document.elementFromPoint = vi.fn().mockReturnValue(el);
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true, configurable: true });

    const ref = { current: el } as RefObject<HTMLElement>;

    const { result } = renderHook(() => useTrulyVisible(ref));

    expect(result.current).toBe(true);
  });

  it('returns false when element is occluded by another element', () => {
    const el = document.createElement('div');
    const overlayEl = document.createElement('div');
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      top: 10,
      right: 100,
      bottom: 100,
      width: 90,
      height: 90,
      x: 10,
      y: 10,
      toJSON: () => {},
    });
    vi.spyOn(el, 'contains').mockReturnValue(false);
    document.elementFromPoint = vi.fn().mockReturnValue(overlayEl);
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true, configurable: true });

    const ref = { current: el } as RefObject<HTMLElement>;

    const { result } = renderHook(() => useTrulyVisible(ref));

    expect(result.current).toBe(false);
  });

  it('cleans up event listeners on unmount', () => {
    const el = document.createElement('div');
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 50,
      bottom: 50,
      width: 50,
      height: 50,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
    document.elementFromPoint = vi.fn().mockReturnValue(null);
    const ref = { current: el } as RefObject<HTMLElement>;
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useTrulyVisible(ref));
    unmount();

    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
