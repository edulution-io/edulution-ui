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
import server from '@libs/test-utils/msw/server';
import useEduApiStore from './useEduApiStore';

const initialStoreState = useEduApiStore.getState();

describe('useEduApiStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useEduApiStore.setState(initialStoreState, true);
  });

  describe('getIsEduApiHealthy', () => {
    it('returns true when health check responds with 200', async () => {
      server.use(http.get('/edu-api/health', () => new HttpResponse(null, { status: 200 })));

      const result = await useEduApiStore.getState().getIsEduApiHealthy();

      expect(result).toBe(true);
      expect(useEduApiStore.getState().isEduApiHealthy).toBe(true);
      expect(useEduApiStore.getState().isEduApiHealthyLoading).toBe(false);
    });

    it('returns false when health check fails', async () => {
      server.use(http.get('/edu-api/health', () => HttpResponse.error()));

      const result = await useEduApiStore.getState().getIsEduApiHealthy();

      expect(result).toBe(false);
      expect(useEduApiStore.getState().isEduApiHealthy).toBe(false);
      expect(useEduApiStore.getState().isEduApiHealthyLoading).toBe(false);
    });

    it('sets isEduApiHealthyLoading to true during request', async () => {
      let resolveRequest: () => void;
      const pending = new Promise<void>((resolve) => {
        resolveRequest = resolve;
      });

      server.use(
        http.get('/edu-api/health', async () => {
          await pending;
          return new HttpResponse(null, { status: 200 });
        }),
      );

      const promise = useEduApiStore.getState().getIsEduApiHealthy();

      expect(useEduApiStore.getState().isEduApiHealthyLoading).toBe(true);

      resolveRequest!();
      await promise;

      expect(useEduApiStore.getState().isEduApiHealthyLoading).toBe(false);
    });
  });

  describe('reset', () => {
    it('resets state to initial values', async () => {
      server.use(http.get('/edu-api/health', () => new HttpResponse(null, { status: 200 })));
      await useEduApiStore.getState().getIsEduApiHealthy();

      useEduApiStore.getState().reset();

      expect(useEduApiStore.getState().isEduApiHealthy).toBeUndefined();
      expect(useEduApiStore.getState().isEduApiHealthyLoading).toBe(false);
      expect(useEduApiStore.getState().error).toBeNull();
    });
  });
});
