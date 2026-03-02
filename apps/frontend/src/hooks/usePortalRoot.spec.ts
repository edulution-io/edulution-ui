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
import usePortalRoot from './usePortalRoot';

describe('usePortalRoot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    const el = document.getElementById('test-portal');
    if (el) el.remove();
  });

  it('creates a new DOM element when none exists with the given id', () => {
    const { result } = renderHook(() => usePortalRoot('test-portal'));

    expect(result.current).toBeInstanceOf(HTMLDivElement);
    expect(result.current?.id).toBe('test-portal');
    expect(document.getElementById('test-portal')).toBe(result.current);
  });

  it('reuses an existing DOM element with the given id', () => {
    const existing = document.createElement('div');
    existing.id = 'test-portal';
    document.body.appendChild(existing);

    const { result } = renderHook(() => usePortalRoot('test-portal'));

    expect(result.current).toBe(existing);
    expect(document.querySelectorAll('#test-portal')).toHaveLength(1);
  });

  it('returns null initially before effect runs', () => {
    let initialValue: HTMLElement | null = undefined as unknown as HTMLElement | null;
    renderHook(() => {
      const val = usePortalRoot('test-portal');
      if (initialValue === (undefined as unknown)) {
        initialValue = val;
      }
      return val;
    });

    expect(initialValue).toBeNull();
  });
});
