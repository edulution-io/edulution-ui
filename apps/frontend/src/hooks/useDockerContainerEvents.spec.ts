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

const mockUpdateContainers = vi.fn();

vi.mock('@/pages/Settings/AppConfig/DockerIntegration/useDockerApplicationStore', () => ({
  default: () => ({ updateContainers: mockUpdateContainers }),
}));

import { renderHook } from '@testing-library/react';
import useSseStore from '@/store/useSseStore';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import useDockerContainerEvents from './useDockerContainerEvents';

type ListenerEntry = { type: string; handler: EventListenerOrEventListenerObject };

class MockEventSource {
  private listeners: ListenerEntry[] = [];

  addEventListener(type: string, handler: EventListenerOrEventListenerObject) {
    this.listeners.push({ type, handler });
  }

  removeEventListener(type: string, handler: EventListenerOrEventListenerObject) {
    this.listeners = this.listeners.filter((e) => !(e.type === type && e.handler === handler));
  }

  dispatch(type: string, data: unknown) {
    const event = { data: JSON.stringify(data) } as MessageEvent<string>;
    this.listeners.filter((e) => e.type === type).forEach((e) => (e.handler as (ev: MessageEvent) => void)(event));
  }

  close() {
    this.listeners = [];
  }

  getListenersByType(type: string) {
    return this.listeners.filter((e) => e.type === type);
  }
}

describe('useDockerContainerEvents', () => {
  let mockEs: MockEventSource;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEs = new MockEventSource();
    useSseStore.setState({ eventSource: mockEs as unknown as EventSource });
  });

  afterEach(() => {
    useSseStore.setState({ eventSource: null });
  });

  it('registers CONTAINER_UPDATE listener when eventSource exists', () => {
    renderHook(() => useDockerContainerEvents());

    expect(mockEs.getListenersByType(SSE_MESSAGE_TYPE.CONTAINER_UPDATE)).toHaveLength(1);
  });

  it('does not register CONTAINER_UPDATE listener when eventSource is null', () => {
    useSseStore.setState({ eventSource: null });

    renderHook(() => useDockerContainerEvents());

    expect(mockEs.getListenersByType(SSE_MESSAGE_TYPE.CONTAINER_UPDATE)).toHaveLength(0);
  });

  it('calls updateContainers when CONTAINER_UPDATE event is received', () => {
    renderHook(() => useDockerContainerEvents());

    const containers = [{ Id: 'abc123', Names: ['/test'] }];
    mockEs.dispatch(SSE_MESSAGE_TYPE.CONTAINER_UPDATE, containers);

    expect(mockUpdateContainers).toHaveBeenCalledWith(containers);
  });

  it('does not call updateContainers when event data is null', () => {
    renderHook(() => useDockerContainerEvents());

    mockEs.dispatch(SSE_MESSAGE_TYPE.CONTAINER_UPDATE, null);

    expect(mockUpdateContainers).not.toHaveBeenCalled();
  });

  it('removes CONTAINER_UPDATE listener on unmount', () => {
    const { unmount } = renderHook(() => useDockerContainerEvents());

    expect(mockEs.getListenersByType(SSE_MESSAGE_TYPE.CONTAINER_UPDATE)).toHaveLength(1);

    unmount();

    expect(mockEs.getListenersByType(SSE_MESSAGE_TYPE.CONTAINER_UPDATE)).toHaveLength(0);
  });

  it('re-registers listener when eventSource changes', () => {
    const { rerender } = renderHook(() => useDockerContainerEvents());

    expect(mockEs.getListenersByType(SSE_MESSAGE_TYPE.CONTAINER_UPDATE)).toHaveLength(1);

    const newEs = new MockEventSource();
    useSseStore.setState({ eventSource: newEs as unknown as EventSource });

    rerender();

    expect(mockEs.getListenersByType(SSE_MESSAGE_TYPE.CONTAINER_UPDATE)).toHaveLength(0);
    expect(newEs.getListenersByType(SSE_MESSAGE_TYPE.CONTAINER_UPDATE)).toHaveLength(1);
  });
});
