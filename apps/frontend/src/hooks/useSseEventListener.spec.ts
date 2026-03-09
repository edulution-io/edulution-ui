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

vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() } }));
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key }, t: (key: string) => key }));

import { renderHook } from '@testing-library/react';
import useSseStore from '@/store/useSseStore';
import useSseEventListener from './useSseEventListener';

type ListenerEntry = { type: string; listener: EventListener; options?: AddEventListenerOptions };

class MockEventSource {
  static CONNECTING = 0;

  static OPEN = 1;

  static CLOSED = 2;

  CONNECTING = 0;

  OPEN = 1;

  CLOSED = 2;

  readyState = MockEventSource.OPEN;

  url: string;

  withCredentials = false;

  onerror: ((ev: Event) => void) | null = null;

  onmessage: ((ev: MessageEvent) => void) | null = null;

  onopen: ((ev: Event) => void) | null = null;

  private listeners: ListenerEntry[] = [];

  constructor(url: string) {
    this.url = url;
  }

  addEventListener(type: string, listener: EventListener, options?: AddEventListenerOptions) {
    this.listeners.push({ type, listener, options });
    if (options?.signal) {
      options.signal.addEventListener('abort', () => {
        this.listeners = this.listeners.filter((e) => e.listener !== listener);
      });
    }
  }

  removeEventListener(_type: string, _listener: EventListener) {
    this.listeners = this.listeners.filter((e) => e.listener !== _listener);
  }

  dispatchEvent(event: Event): boolean {
    this.listeners.filter((e) => e.type === event.type).forEach((e) => e.listener(event));
    return true;
  }

  close() {
    this.readyState = MockEventSource.CLOSED;
  }

  getListeners() {
    return this.listeners;
  }
}

describe('useSseEventListener', () => {
  let mockEs: MockEventSource;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEs = new MockEventSource('http://test/sse');
    useSseStore.setState({ eventSource: mockEs as unknown as EventSource });
  });

  afterEach(() => {
    useSseStore.getState().reset();
  });

  it('registers listener for a single event type when enabled', () => {
    const handler = vi.fn();

    renderHook(() => useSseEventListener('test-event', handler));

    expect(mockEs.getListeners()).toHaveLength(1);
    expect(mockEs.getListeners()[0].type).toBe('test-event');
  });

  it('registers listener for each event type when array is provided', () => {
    const handler = vi.fn();

    renderHook(() => useSseEventListener(['event-a', 'event-b', 'event-c'], handler));

    expect(mockEs.getListeners()).toHaveLength(3);
    expect(mockEs.getListeners().map((l) => l.type)).toEqual(['event-a', 'event-b', 'event-c']);
  });

  it('does not register listeners when enabled is false', () => {
    const handler = vi.fn();

    renderHook(() => useSseEventListener('test-event', handler, { enabled: false }));

    expect(mockEs.getListeners()).toHaveLength(0);
  });

  it('does not register listeners when eventSource is null', () => {
    useSseStore.setState({ eventSource: null });
    const handler = vi.fn();

    renderHook(() => useSseEventListener('test-event', handler));

    expect(mockEs.getListeners()).toHaveLength(0);
  });

  it('removes listeners on unmount via AbortController', () => {
    const handler = vi.fn();

    const { unmount } = renderHook(() => useSseEventListener('test-event', handler));

    expect(mockEs.getListeners()).toHaveLength(1);

    unmount();

    expect(mockEs.getListeners()).toHaveLength(0);
  });

  it('invokes handler when matching event is dispatched', () => {
    const handler = vi.fn();

    renderHook(() => useSseEventListener('custom-event', handler));

    const event = new Event('custom-event');
    mockEs.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('re-registers listeners when eventSource changes', () => {
    const handler = vi.fn();

    const { rerender } = renderHook(() => useSseEventListener('test-event', handler));

    expect(mockEs.getListeners()).toHaveLength(1);

    const newEs = new MockEventSource('http://test/sse-2');
    useSseStore.setState({ eventSource: newEs as unknown as EventSource });

    rerender();

    expect(mockEs.getListeners()).toHaveLength(0);
    expect(newEs.getListeners()).toHaveLength(1);
    expect(newEs.getListeners()[0].type).toBe('test-event');
  });

  it('defaults to enabled when options are not provided', () => {
    const handler = vi.fn();

    renderHook(() => useSseEventListener('test-event', handler));

    expect(mockEs.getListeners()).toHaveLength(1);
  });
});
