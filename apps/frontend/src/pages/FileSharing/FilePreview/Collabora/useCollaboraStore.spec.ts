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

import { http, HttpResponse } from 'msw';
import server from '@libs/test-utils/msw/server';
import useCollaboraStore from './useCollaboraStore';

const COLLABORA_FALLBACK_EDITOR_PATH = '/browser/dist/cool.html';

const initialStoreState = useCollaboraStore.getState();

describe('useCollaboraStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCollaboraStore.setState(initialStoreState, true);
  });

  describe('initial state', () => {
    it('has correct default values', () => {
      const state = useCollaboraStore.getState();

      expect(state.accessToken).toBe('');
      expect(state.accessTokenTTL).toBe(0);
      expect(state.editorPath).toBe(COLLABORA_FALLBACK_EDITOR_PATH);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchWopiToken', () => {
    it('sets loading state and stores token on success', async () => {
      const mockToken = { accessToken: 'wopi-token-123', accessTokenTTL: 86400000 };

      server.use(http.post('*/filesharing/collabora-token', () => HttpResponse.json(mockToken)));

      await useCollaboraStore.getState().fetchWopiToken('/docs/test.docx', 'default');

      const state = useCollaboraStore.getState();
      expect(state.accessToken).toBe('wopi-token-123');
      expect(state.accessTokenTTL).toBe(86400000);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('sends filePath and share in request body', async () => {
      let requestBody: Record<string, unknown> = {};

      server.use(
        http.post('*/filesharing/collabora-token', async ({ request }) => {
          requestBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ accessToken: 'token', accessTokenTTL: 0 });
        }),
      );

      await useCollaboraStore.getState().fetchWopiToken('/docs/test.docx', 'my-share');

      expect(requestBody).toEqual(
        expect.objectContaining({
          filePath: '/docs/test.docx',
          share: 'my-share',
        }),
      );
      expect(requestBody).not.toHaveProperty('origin');
    });

    it('sets isLoading to false on error', async () => {
      server.use(
        http.post('*/filesharing/collabora-token', () =>
          HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
        ),
      );

      await useCollaboraStore.getState().fetchWopiToken('/docs/test.docx', 'default');

      const state = useCollaboraStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.accessToken).toBe('');
    });
  });

  describe('fetchEditorPath', () => {
    it('parses editor path from discovery XML', async () => {
      const discoveryXml = `<?xml version="1.0"?>
        <wopi-discovery>
          <net-zone name="external-http">
            <app name="application/vnd.oasis.opendocument.text">
              <action name="edit" urlsrc="https://collabora.example.com/browser/abc/cool.html?"/>
            </app>
          </net-zone>
        </wopi-discovery>`;

      server.use(http.get('https://collabora.example.com/hosting/discovery', () => HttpResponse.text(discoveryXml)));

      await useCollaboraStore.getState().fetchEditorPath('https://collabora.example.com');

      expect(useCollaboraStore.getState().editorPath).toBe('/browser/abc/cool.html');
    });

    it('uses fallback path when discovery XML has no edit action', async () => {
      const discoveryXml = `<?xml version="1.0"?><wopi-discovery></wopi-discovery>`;

      server.use(http.get('https://collabora.example.com/hosting/discovery', () => HttpResponse.text(discoveryXml)));

      await useCollaboraStore.getState().fetchEditorPath('https://collabora.example.com');

      expect(useCollaboraStore.getState().editorPath).toBe(COLLABORA_FALLBACK_EDITOR_PATH);
    });

    it('uses fallback path when request fails', async () => {
      server.use(http.get('https://collabora.example.com/hosting/discovery', () => HttpResponse.error()));

      await useCollaboraStore.getState().fetchEditorPath('https://collabora.example.com');

      expect(useCollaboraStore.getState().editorPath).toBe(COLLABORA_FALLBACK_EDITOR_PATH);
    });

    it('skips request when editorPath is already set', async () => {
      useCollaboraStore.setState({ editorPath: '/custom/path/cool.html' });

      let requestMade = false;
      server.use(
        http.get('https://collabora.example.com/hosting/discovery', () => {
          requestMade = true;
          return HttpResponse.text('');
        }),
      );

      await useCollaboraStore.getState().fetchEditorPath('https://collabora.example.com');

      expect(requestMade).toBe(false);
    });

    it('uses fallback path when urlsrc is an invalid URL', async () => {
      const discoveryXml = `<?xml version="1.0"?>
        <wopi-discovery>
          <net-zone name="external-http">
            <app name="application/vnd.oasis.opendocument.text">
              <action name="edit" urlsrc="not-a-valid-url"/>
            </app>
          </net-zone>
        </wopi-discovery>`;

      server.use(http.get('https://collabora.example.com/hosting/discovery', () => HttpResponse.text(discoveryXml)));

      await useCollaboraStore.getState().fetchEditorPath('https://collabora.example.com');

      expect(useCollaboraStore.getState().editorPath).toBe(COLLABORA_FALLBACK_EDITOR_PATH);
    });

    it('strips collabora base path from editor path', async () => {
      const discoveryXml = `<?xml version="1.0"?>
        <wopi-discovery>
          <net-zone name="external-http">
            <app name="application/vnd.oasis.opendocument.text">
              <action name="edit" urlsrc="https://collabora.example.com/collabora/browser/abc/cool.html?"/>
            </app>
          </net-zone>
        </wopi-discovery>`;

      server.use(
        http.get('https://collabora.example.com/collabora/hosting/discovery', () => HttpResponse.text(discoveryXml)),
      );

      await useCollaboraStore.getState().fetchEditorPath('https://collabora.example.com/collabora');

      expect(useCollaboraStore.getState().editorPath).toBe('/browser/abc/cool.html');
    });
  });

  describe('reset', () => {
    it('resets token and loading state but preserves editorPath', () => {
      useCollaboraStore.setState({
        accessToken: 'some-token',
        accessTokenTTL: 12345,
        editorPath: '/custom/editor/path',
        isLoading: true,
        error: 'some error',
      });

      useCollaboraStore.getState().reset();

      const state = useCollaboraStore.getState();
      expect(state.accessToken).toBe('');
      expect(state.accessTokenTTL).toBe(0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.editorPath).toBe('/custom/editor/path');
    });
  });
});
