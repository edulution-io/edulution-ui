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

import { renderHook, act } from '@testing-library/react';
import useFontAwesomeHoverAnimation from './useFontAwesomeHoverAnimation';

describe('useFontAwesomeHoverAnimation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns animate as false initially', () => {
    const { result } = renderHook(() => useFontAwesomeHoverAnimation());

    expect(result.current.animate).toBe(false);
  });

  it('sets animate to true after calling triggerAnimation', () => {
    const { result } = renderHook(() => useFontAwesomeHoverAnimation());

    act(() => {
      result.current.triggerAnimation();
    });

    expect(result.current.animate).toBe(true);
  });

  it('resets animate to false after FONTAWSOME_HOVER_ANIM_MS timeout', () => {
    const { result } = renderHook(() => useFontAwesomeHoverAnimation());

    act(() => {
      result.current.triggerAnimation();
    });

    expect(result.current.animate).toBe(true);

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(result.current.animate).toBe(false);
  });

  it('restarts the timer when triggerAnimation is called multiple times', () => {
    const { result } = renderHook(() => useFontAwesomeHoverAnimation());

    act(() => {
      result.current.triggerAnimation();
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.animate).toBe(true);

    act(() => {
      result.current.triggerAnimation();
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.animate).toBe(true);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.animate).toBe(false);
  });
});
