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
import useSubMenuStore from '@/store/useSubMenuStore';
import useScrollToSection from './useScrollToSection';

describe('useScrollToSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    useSubMenuStore.setState({
      activeSection: null,
      sectionToOpen: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('returns a scrollToSection function', () => {
    const { result } = renderHook(() => useScrollToSection());

    expect(result.current.scrollToSection).toBeInstanceOf(Function);
  });

  it('calls requestOpenSection with the given section id', () => {
    const { result } = renderHook(() => useScrollToSection());

    act(() => {
      result.current.scrollToSection('section-1');
    });

    const state = useSubMenuStore.getState();
    expect(state.sectionToOpen).toBe('section-1');
    expect(state.activeSection).toBe('section-1');
  });

  it('clears activeSection after HIGHLIGHT_DURATION_MS', () => {
    const { result } = renderHook(() => useScrollToSection());

    act(() => {
      result.current.scrollToSection('section-1');
    });

    expect(useSubMenuStore.getState().activeSection).toBe('section-1');

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(useSubMenuStore.getState().activeSection).toBeNull();
  });

  it('scrolls the target element into view after SCROLL_DELAY_MS', () => {
    const el = document.createElement('div');
    el.id = 'scroll-target';
    el.scrollIntoView = vi.fn();
    document.body.appendChild(el);

    const { result } = renderHook(() => useScrollToSection());

    act(() => {
      result.current.scrollToSection('scroll-target');
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'nearest' });
  });

  it('clears pending timeouts on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { result, unmount } = renderHook(() => useScrollToSection());

    act(() => {
      result.current.scrollToSection('section-1');
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
