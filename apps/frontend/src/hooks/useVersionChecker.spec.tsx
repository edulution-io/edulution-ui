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

vi.mock('sonner', () => ({ toast: { info: vi.fn(), error: vi.fn(), success: vi.fn(), dismiss: vi.fn() } }));
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key }, t: (key: string) => key }));
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => null,
}));

import { renderHook, act } from '@testing-library/react';
import { toast } from 'sonner';
import useSseStore from '@/store/useSseStore';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import useVersionChecker from './useVersionChecker';

type ListenerEntry = {
  type: string;
  handler: EventListener;
  options?: AddEventListenerOptions;
};

class MockEventSource {
  private listeners: ListenerEntry[] = [];

  addEventListener(type: string, handler: EventListener, options?: AddEventListenerOptions) {
    this.listeners.push({ type, handler, options });
    if (options?.signal) {
      options.signal.addEventListener('abort', () => {
        this.listeners = this.listeners.filter((e) => e.handler !== handler);
      });
    }
  }

  removeEventListener(_type: string, _handler: EventListener) {
    this.listeners = this.listeners.filter((e) => e.handler !== _handler);
  }

  dispatch(type: string, data: unknown) {
    const event = Object.assign(new Event(type), { data: JSON.stringify(data) }) as MessageEvent;
    this.listeners.filter((e) => e.type === type).forEach((e) => e.handler(event));
  }

  getListenersByType(type: string) {
    return this.listeners.filter((e) => e.type === type);
  }

  close() {
    this.listeners = [];
  }
}

declare const APP_VERSION: string;

describe('useVersionChecker', () => {
  let mockEs: MockEventSource;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEs = new MockEventSource();
    useSseStore.setState({ eventSource: mockEs as unknown as EventSource });
  });

  afterEach(() => {
    useSseStore.setState({ eventSource: null });
  });

  it('registers PING listener when eventSource exists', () => {
    renderHook(() => useVersionChecker());

    expect(mockEs.getListenersByType(SSE_MESSAGE_TYPE.PING)).toHaveLength(1);
  });

  it('does not register PING listener when eventSource is null', () => {
    useSseStore.setState({ eventSource: null });

    renderHook(() => useVersionChecker());

    expect(mockEs.getListenersByType(SSE_MESSAGE_TYPE.PING)).toHaveLength(0);
  });

  it('does not show toast when version matches', () => {
    renderHook(() => useVersionChecker());

    act(() => {
      mockEs.dispatch(SSE_MESSAGE_TYPE.PING, { version: String(APP_VERSION) });
    });

    expect(toast.info).not.toHaveBeenCalled();
  });

  it('shows toast when version differs', () => {
    renderHook(() => useVersionChecker());

    act(() => {
      mockEs.dispatch(SSE_MESSAGE_TYPE.PING, { version: '99.99.99' });
    });

    expect(toast.info).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        duration: Infinity,
        position: 'top-right',
      }),
    );
  });

  it('removes PING listener on unmount via AbortController', () => {
    const { unmount } = renderHook(() => useVersionChecker());

    expect(mockEs.getListenersByType(SSE_MESSAGE_TYPE.PING)).toHaveLength(1);

    unmount();

    expect(mockEs.getListenersByType(SSE_MESSAGE_TYPE.PING)).toHaveLength(0);
  });

  it('does not throw when event data is invalid JSON', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(() => useVersionChecker());

    const event = Object.assign(new Event(SSE_MESSAGE_TYPE.PING), {
      data: 'not valid json',
    }) as MessageEvent;

    act(() => {
      mockEs.getListenersByType(SSE_MESSAGE_TYPE.PING)[0].handler(event);
    });

    expect(toast.info).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
