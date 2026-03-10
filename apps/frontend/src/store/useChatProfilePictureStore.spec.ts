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

import { http, HttpResponse } from 'msw';
import { CHAT_PROFILE_PICTURES_ENDPOINT } from '@libs/chat/constants/chatApiEndpoints';
import server from '@libs/test-utils/msw/server';
import useChatProfilePictureStore from './useChatProfilePictureStore';

const initialStoreState = useChatProfilePictureStore.getState();

describe('useChatProfilePictureStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useChatProfilePictureStore.setState(initialStoreState, true);
  });

  describe('fetchProfilePictures', () => {
    it('fetches and caches profile pictures', async () => {
      server.use(
        http.post(CHAT_PROFILE_PICTURES_ENDPOINT, () =>
          HttpResponse.json({ alice: 'base64-alice', bob: 'base64-bob' }),
        ),
      );

      await useChatProfilePictureStore.getState().fetchProfilePictures(['alice', 'bob']);

      const { cache } = useChatProfilePictureStore.getState();
      expect(cache.alice).toBe('base64-alice');
      expect(cache.bob).toBe('base64-bob');
    });

    it('does not update cache when there are no changes', async () => {
      useChatProfilePictureStore.setState({ cache: { alice: 'base64-alice' } });

      server.use(http.post(CHAT_PROFILE_PICTURES_ENDPOINT, () => HttpResponse.json({ alice: 'base64-alice' })));

      await useChatProfilePictureStore.getState().fetchProfilePictures(['alice']);

      expect(useChatProfilePictureStore.getState().cache.alice).toBe('base64-alice');
    });

    it('removes cached entry when server returns no picture', async () => {
      useChatProfilePictureStore.setState({ cache: { alice: 'old-picture' } });

      server.use(http.post(CHAT_PROFILE_PICTURES_ENDPOINT, () => HttpResponse.json({})));

      await useChatProfilePictureStore.getState().fetchProfilePictures(['alice']);

      expect(useChatProfilePictureStore.getState().cache.alice).toBeUndefined();
    });

    it('skips fetch for empty usernames array', async () => {
      const spy = vi.fn();
      server.use(
        http.post(CHAT_PROFILE_PICTURES_ENDPOINT, () => {
          spy();
          return HttpResponse.json({});
        }),
      );

      await useChatProfilePictureStore.getState().fetchProfilePictures([]);

      expect(spy).not.toHaveBeenCalled();
    });

    it('handles API errors gracefully', async () => {
      server.use(http.post(CHAT_PROFILE_PICTURES_ENDPOINT, () => HttpResponse.json(null, { status: 500 })));

      await useChatProfilePictureStore.getState().fetchProfilePictures(['alice']);

      expect(useChatProfilePictureStore.getState().cache).toEqual({});
    });
  });

  describe('reset', () => {
    it('clears the cache', () => {
      useChatProfilePictureStore.setState({ cache: { alice: 'base64-alice' } });

      useChatProfilePictureStore.getState().reset();

      expect(useChatProfilePictureStore.getState().cache).toEqual({});
    });
  });
});
