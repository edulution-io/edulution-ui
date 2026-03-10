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

const mockFetchMessages = vi.fn();
const mockSetCurrentConversation = vi.fn();
const mockSendMessage = vi.fn();
const mockAddMessage = vi.fn();
const mockFetchProfilePictures = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/hooks/useSseEventListener', () => ({
  default: vi.fn(),
}));

vi.mock('@/store/UserStore/useUserStore', () => ({
  default: () => ({ user: { username: 'currentuser' } }),
}));

vi.mock('@/pages/Chat/useChatStore', () => ({
  default: () => ({
    messages: [],
    isLoading: false,
    isSending: false,
    error: null,
    fetchMessages: mockFetchMessages,
    sendMessage: mockSendMessage,
    setCurrentConversation: mockSetCurrentConversation,
    addMessage: mockAddMessage,
  }),
}));

vi.mock('@/store/useChatProfilePictureStore', () => {
  const store = vi.fn(() => ({}));
  store.getState = () => ({ cache: {}, fetchProfilePictures: mockFetchProfilePictures });
  store.setState = vi.fn();
  store.subscribe = vi.fn();
  return { default: store };
});

import { renderHook, act } from '@testing-library/react';
import type GroupTypeLocation from '@libs/chat/types/groupTypeLocation';
import useGroupChat from './useGroupChat';

describe('useGroupChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets current conversation and fetches messages on mount', () => {
    renderHook(() => useGroupChat('test-group', 'classes' as GroupTypeLocation));

    expect(mockSetCurrentConversation).toHaveBeenCalled();
    expect(mockFetchMessages).toHaveBeenCalled();
  });

  it('returns form with message field', () => {
    const { result } = renderHook(() => useGroupChat('test-group', 'classes' as GroupTypeLocation));

    expect(result.current.form).toBeDefined();
    expect(result.current.form.getValues('message')).toBe('');
  });

  it('returns isLoading state', () => {
    const { result } = renderHook(() => useGroupChat('test-group', 'classes' as GroupTypeLocation));

    expect(result.current.isLoading).toBe(false);
  });

  it('returns error as null when no error', () => {
    const { result } = renderHook(() => useGroupChat('test-group', 'classes' as GroupTypeLocation));

    expect(result.current.error).toBeNull();
  });

  it('provides onSubmit that calls sendMessage', async () => {
    const { result } = renderHook(() => useGroupChat('test-group', 'classes' as GroupTypeLocation));

    await act(async () => {
      await result.current.onSubmit({ message: 'hello' });
    });

    expect(mockSendMessage).toHaveBeenCalled();
  });

  it('does not send empty messages', async () => {
    const { result } = renderHook(() => useGroupChat('test-group', 'classes' as GroupTypeLocation));

    await act(async () => {
      await result.current.onSubmit({ message: '   ' });
    });

    expect(mockSendMessage).not.toHaveBeenCalled();
  });
});
