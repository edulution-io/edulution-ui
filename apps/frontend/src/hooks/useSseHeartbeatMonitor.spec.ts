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
import useSseStore from '@/store/useSseStore';
import { SSE_PING_TIMEOUT_MS } from '@libs/sse/constants/sseConfig';
import useSseHeartbeatMonitor from './useSseHeartbeatMonitor';

const MOCK_EVENT_SOURCE = { close: vi.fn() } as unknown as EventSource;

describe('useSseHeartbeatMonitor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    useSseStore.getState().reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not start interval when eventSource is null', () => {
    useSseStore.setState({ eventSource: null });
    const setIntervalSpy = vi.spyOn(global, 'setInterval');

    renderHook(() => useSseHeartbeatMonitor());

    expect(setIntervalSpy).not.toHaveBeenCalled();
    setIntervalSpy.mockRestore();
  });

  it('starts interval when eventSource exists', () => {
    useSseStore.setState({ eventSource: MOCK_EVENT_SOURCE });
    const setIntervalSpy = vi.spyOn(global, 'setInterval');

    renderHook(() => useSseHeartbeatMonitor());

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), SSE_PING_TIMEOUT_MS);
    setIntervalSpy.mockRestore();
  });

  it('calls reconnect when lastPingTime exceeds timeout', () => {
    const reconnect = vi.fn();
    const now = Date.now();
    useSseStore.setState({
      eventSource: MOCK_EVENT_SOURCE,
      lastPingTime: now - SSE_PING_TIMEOUT_MS - 1000,
      reconnect,
    });

    renderHook(() => useSseHeartbeatMonitor());

    vi.advanceTimersByTime(SSE_PING_TIMEOUT_MS);

    expect(reconnect).toHaveBeenCalledTimes(1);
  });

  it('does not call reconnect when lastPingTime is recent', () => {
    const reconnect = vi.fn();
    useSseStore.setState({
      eventSource: MOCK_EVENT_SOURCE,
      lastPingTime: Date.now(),
      reconnect,
    });

    renderHook(() => useSseHeartbeatMonitor());

    vi.advanceTimersByTime(SSE_PING_TIMEOUT_MS);

    expect(reconnect).not.toHaveBeenCalled();
  });

  it('does not call reconnect when lastPingTime is null', () => {
    const reconnect = vi.fn();
    useSseStore.setState({
      eventSource: MOCK_EVENT_SOURCE,
      lastPingTime: null,
      reconnect,
    });

    renderHook(() => useSseHeartbeatMonitor());

    vi.advanceTimersByTime(SSE_PING_TIMEOUT_MS);

    expect(reconnect).not.toHaveBeenCalled();
  });

  it('clears interval on unmount', () => {
    useSseStore.setState({ eventSource: MOCK_EVENT_SOURCE });
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const { unmount } = renderHook(() => useSseHeartbeatMonitor());

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('clears old interval and starts new one when eventSource changes', () => {
    useSseStore.setState({ eventSource: MOCK_EVENT_SOURCE });
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const { rerender } = renderHook(() => useSseHeartbeatMonitor());

    const newEs = { close: vi.fn() } as unknown as EventSource;
    useSseStore.setState({ eventSource: newEs });

    rerender();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});
