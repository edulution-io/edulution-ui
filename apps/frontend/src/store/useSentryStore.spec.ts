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

const mockSentryInit = vi.fn();
const mockSentrySetTag = vi.fn();

vi.mock('@sentry/react', () => ({
  init: mockSentryInit,
  setTag: mockSentrySetTag,
}));

import { http, HttpResponse } from 'msw';
import server from '@libs/test-utils/msw/server';
import useSentryStore from './useSentryStore';

const initialStoreState = useSentryStore.getState();

describe('useSentryStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useSentryStore.setState(initialStoreState, true);
  });

  describe('init', () => {
    it('initializes Sentry with the provided config', async () => {
      const config = { dsn: 'https://key@sentry.io/123', enabled: true };

      await useSentryStore.getState().init(config);

      expect(mockSentryInit).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://key@sentry.io/123',
          environment: 'localhost',
          sendDefaultPii: true,
          tracesSampleRate: 1.0,
        }),
      );
      expect(mockSentrySetTag).toHaveBeenCalledWith('tenant', 'localhost');
      expect(useSentryStore.getState().initialized).toBe(true);
      expect(useSentryStore.getState().config).toEqual(config);
    });

    it('does not re-initialize when already initialized', async () => {
      useSentryStore.setState({ initialized: true });

      await useSentryStore.getState().init({ dsn: 'https://key@sentry.io/123', enabled: true });

      expect(mockSentryInit).not.toHaveBeenCalled();
    });

    it('does not initialize when dsn is empty', async () => {
      await useSentryStore.getState().init({ dsn: '', enabled: true });

      expect(mockSentryInit).not.toHaveBeenCalled();
      expect(useSentryStore.getState().initialized).toBe(false);
    });

    it('does not initialize when config is null', async () => {
      await useSentryStore.getState().init(null as never);

      expect(mockSentryInit).not.toHaveBeenCalled();
      expect(useSentryStore.getState().initialized).toBe(false);
    });
  });

  describe('fetchAndInitSentry', () => {
    it('fetches config and initializes Sentry', async () => {
      const config = { dsn: 'https://key@sentry.io/456', enabled: true };
      server.use(http.get('/edu-api/global-settings/sentry', () => HttpResponse.json(config)));

      await useSentryStore.getState().fetchAndInitSentry();

      expect(useSentryStore.getState().config).toEqual(config);
      expect(mockSentryInit).toHaveBeenCalled();
      expect(useSentryStore.getState().initialized).toBe(true);
    });

    it('handles fetch failure gracefully', async () => {
      server.use(
        http.get('/edu-api/global-settings/sentry', () =>
          HttpResponse.json({ message: 'not.found', statusCode: 404 }, { status: 404 }),
        ),
      );

      await useSentryStore.getState().fetchAndInitSentry();

      expect(mockSentryInit).not.toHaveBeenCalled();
      expect(useSentryStore.getState().initialized).toBe(false);
    });
  });

  describe('clear', () => {
    it('resets initialized and config', () => {
      useSentryStore.setState({
        initialized: true,
        config: { dsn: 'https://key@sentry.io/123', enabled: true },
      });

      useSentryStore.getState().clear();

      expect(useSentryStore.getState().initialized).toBe(false);
      expect(useSentryStore.getState().config).toBeNull();
    });
  });

  describe('reset', () => {
    it('is a no-op to preserve Sentry initialization across logout', () => {
      useSentryStore.setState({
        initialized: true,
        config: { dsn: 'https://key@sentry.io/123', enabled: true },
      });

      useSentryStore.getState().reset();

      expect(useSentryStore.getState().initialized).toBe(true);
      expect(useSentryStore.getState().config).toEqual({ dsn: 'https://key@sentry.io/123', enabled: true });
    });
  });
});
