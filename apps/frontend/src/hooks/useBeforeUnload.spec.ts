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
import useBeforeUnload from './useBeforeUnload';

describe('useBeforeUnload', () => {
  let addSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addSpy = vi.spyOn(window, 'addEventListener');
    removeSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers beforeunload and unload listeners on mount', () => {
    renderHook(() => useBeforeUnload('unsaved changes'));

    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('unload', expect.any(Function));
  });

  it('removes listeners on unmount', () => {
    const { unmount } = renderHook(() => useBeforeUnload('unsaved changes'));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('unload', expect.any(Function));
  });

  it('sets returnValue and calls preventDefault on beforeunload event', () => {
    renderHook(() => useBeforeUnload('unsaved changes'));

    const event = new Event('beforeunload') as BeforeUnloadEvent;
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    Object.defineProperty(event, 'returnValue', { value: '', writable: true });

    window.dispatchEvent(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.returnValue).toBe('unsaved changes');
  });

  it('calls onUnload callback with null when unload fires', () => {
    const onUnload = vi.fn();

    renderHook(() => useBeforeUnload('unsaved changes', onUnload));

    window.dispatchEvent(new Event('unload'));

    expect(onUnload).toHaveBeenCalledWith(null);
  });

  it('does not throw when onUnload is not provided and unload fires', () => {
    renderHook(() => useBeforeUnload('unsaved changes'));

    expect(() => window.dispatchEvent(new Event('unload'))).not.toThrow();
  });

  it('re-registers listeners when message changes', () => {
    const { rerender } = renderHook(({ msg }) => useBeforeUnload(msg), {
      initialProps: { msg: 'first' },
    });

    addSpy.mockClear();
    removeSpy.mockClear();

    rerender({ msg: 'second' });

    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('unload', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('unload', expect.any(Function));
  });
});
