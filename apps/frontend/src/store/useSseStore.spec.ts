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

import useUserStore from './UserStore/useUserStore';
import useSseStore from './useSseStore';

type EventListenerFn = (...args: unknown[]) => void;

type EventListenerEntry = { type: string; listener: EventListenerFn };

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

  private eventListeners: EventListenerEntry[] = [];

  constructor(url: string) {
    this.url = url;
  }

  addEventListener(type: string, listener: EventListenerFn | null) {
    if (listener) {
      this.eventListeners.push({ type, listener });
    }
  }

  removeEventListener(type: string, listener: EventListenerFn | null) {
    this.eventListeners = this.eventListeners.filter((e) => !(e.type === type && e.listener === listener));
  }

  dispatchEvent(event: Event): boolean {
    this.eventListeners.filter((e) => e.type === event.type).forEach((e) => e.listener(event));
    return true;
  }

  close() {
    this.readyState = MockEventSource.CLOSED;
  }
}

describe('useSseStore', () => {
  const originalEventSource = globalThis.EventSource;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    globalThis.EventSource = MockEventSource as unknown as typeof EventSource;
    useSseStore.getState().reset();
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.EventSource = originalEventSource;
  });

  describe('setEventSource', () => {
    it('creates EventSource with token in URL when eduApiToken is set', () => {
      useUserStore.setState({ eduApiToken: 'test-token-123' });

      useSseStore.getState().setEventSource();

      const state = useSseStore.getState();
      expect(state.eventSource).not.toBeNull();
      expect((state.eventSource as unknown as MockEventSource).url).toContain('token=test-token-123');
      expect(state.reconnectAttempts).toBe(0);
    });

    it('does nothing when no eduApiToken is available', () => {
      useUserStore.setState({ eduApiToken: '' });

      useSseStore.getState().setEventSource();

      expect(useSseStore.getState().eventSource).toBeNull();
    });

    it('closes existing EventSource before creating new one', () => {
      useUserStore.setState({ eduApiToken: 'token-1' });

      useSseStore.getState().setEventSource();
      const firstSource = useSseStore.getState().eventSource as unknown as MockEventSource;

      useSseStore.getState().setEventSource();

      expect(firstSource.readyState).toBe(MockEventSource.CLOSED);
      expect(useSseStore.getState().eventSource).not.toBeNull();
    });
  });

  describe('ping event', () => {
    it('updates lastPingTime and resets reconnectAttempts', () => {
      useUserStore.setState({ eduApiToken: 'test-token' });
      useSseStore.getState().setEventSource();

      const es = useSseStore.getState().eventSource as unknown as MockEventSource;
      const pingEvent = new Event('ping');
      es.dispatchEvent(pingEvent);

      const state = useSseStore.getState();
      expect(state.lastPingTime).not.toBeNull();
      expect(state.reconnectAttempts).toBe(0);
    });
  });

  describe('error event with CLOSED readyState', () => {
    it('schedules reconnect when EventSource is CLOSED', () => {
      useUserStore.setState({ eduApiToken: 'test-token' });
      useSseStore.getState().setEventSource();

      const es = useSseStore.getState().eventSource as unknown as MockEventSource;
      es.readyState = MockEventSource.CLOSED;

      const errorEvent = new Event('error');
      es.dispatchEvent(errorEvent);

      vi.advanceTimersByTime(10000);

      const state = useSseStore.getState();
      expect(state.reconnectAttempts).toBe(1);
      expect(state.eventSource).not.toBeNull();
    });
  });

  describe('reconnect', () => {
    it('closes existing EventSource and creates new one with incremented attempts', () => {
      useUserStore.setState({ eduApiToken: 'test-token' });
      useSseStore.getState().setEventSource();

      const firstSource = useSseStore.getState().eventSource as unknown as MockEventSource;

      useSseStore.getState().reconnect();

      expect(firstSource.readyState).toBe(MockEventSource.CLOSED);
      expect(useSseStore.getState().reconnectAttempts).toBe(1);
      expect(useSseStore.getState().eventSource).not.toBeNull();
    });

    it('does nothing when no eduApiToken', () => {
      useUserStore.setState({ eduApiToken: '' });

      useSseStore.getState().reconnect();

      expect(useSseStore.getState().eventSource).toBeNull();
    });
  });

  describe('reset', () => {
    it('closes EventSource and resets all state', () => {
      useUserStore.setState({ eduApiToken: 'test-token' });
      useSseStore.getState().setEventSource();

      const es = useSseStore.getState().eventSource as unknown as MockEventSource;

      useSseStore.getState().reset();

      expect(es.readyState).toBe(MockEventSource.CLOSED);
      const state = useSseStore.getState();
      expect(state.eventSource).toBeNull();
      expect(state.reconnectAttempts).toBe(0);
      expect(state.lastPingTime).toBeNull();
    });
  });
});
