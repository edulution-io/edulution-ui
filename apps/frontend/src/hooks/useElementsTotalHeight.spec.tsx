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
import useElementsTotalHeight from './useElementsTotalHeight';

describe('useElementsTotalHeight', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns 0 when no element IDs are provided', () => {
    const { result } = renderHook(() => useElementsTotalHeight([]));

    expect(result.current).toBe(0);
  });

  it('returns 0 when elements do not exist in the DOM', () => {
    const { result } = renderHook(() => useElementsTotalHeight(['nonexistent-1', 'nonexistent-2']));

    expect(result.current).toBe(0);
  });

  it('calculates the combined height of existing elements', () => {
    const el1 = document.createElement('div');
    el1.id = 'el-1';
    Object.defineProperty(el1, 'offsetHeight', { value: 100, configurable: true });
    document.body.appendChild(el1);

    const el2 = document.createElement('div');
    el2.id = 'el-2';
    Object.defineProperty(el2, 'offsetHeight', { value: 50, configurable: true });
    document.body.appendChild(el2);

    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      marginTop: '0',
      marginBottom: '0',
    } as CSSStyleDeclaration);

    const { result } = renderHook(() => useElementsTotalHeight(['el-1', 'el-2']));

    expect(result.current).toBe(150);
  });

  it('includes margins in the calculation', () => {
    const el = document.createElement('div');
    el.id = 'el-margin';
    Object.defineProperty(el, 'offsetHeight', { value: 80, configurable: true });
    document.body.appendChild(el);

    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      marginTop: '10',
      marginBottom: '5',
    } as CSSStyleDeclaration);

    const { result } = renderHook(() => useElementsTotalHeight(['el-margin']));

    expect(result.current).toBe(95);
  });

  it('skips missing elements while summing existing ones', () => {
    const el = document.createElement('div');
    el.id = 'existing';
    Object.defineProperty(el, 'offsetHeight', { value: 60, configurable: true });
    document.body.appendChild(el);

    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      marginTop: '0',
      marginBottom: '0',
    } as CSSStyleDeclaration);

    const { result } = renderHook(() => useElementsTotalHeight(['missing', 'existing']));

    expect(result.current).toBe(60);
  });
});
