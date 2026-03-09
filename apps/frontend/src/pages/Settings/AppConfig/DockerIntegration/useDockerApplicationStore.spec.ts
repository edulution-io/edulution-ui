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

/* eslint-disable */

const mockAxiosGet = vi.hoisted(() => vi.fn());

vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');
  return {
    ...actual,
    default: {
      ...actual.default,
      get: mockAxiosGet,
      isAxiosError: vi.fn(() => false),
    },
    isAxiosError: vi.fn(() => false),
  };
});

vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() } }));
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key }, t: (key: string) => key }));
vi.mock('yaml', () => ({ parse: vi.fn((data: string) => JSON.parse(data)) }));
vi.mock('@libs/docker/constants/dockerCommandTranslationKeys', () => ({
  default: { start: 'docker.events.startContainer', stop: 'docker.events.stopContainer' },
}));
vi.mock('@libs/docker/constants/dockerApplicationList', () => ({
  default: { mail: 'edulution-mail', filesharing: 'edulution-onlyoffice' },
}));

import { toast } from 'sonner';
import { http, HttpResponse } from 'msw';
import server from '@libs/test-utils/msw/server';
import useDockerApplicationStore from './useDockerApplicationStore';

const mockContainer = {
  Id: '123',
  Names: ['/test-container'],
  State: 'running',
  Image: 'test:latest',
  Status: 'Up 2 hours',
};

const initialStoreState = useDockerApplicationStore.getState();

describe('useDockerApplicationStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDockerApplicationStore.setState(initialStoreState, true);
  });

  describe('setSelectedRows', () => {
    it('updates selectedRows', () => {
      useDockerApplicationStore.getState().setSelectedRows({ '0': true });

      expect(useDockerApplicationStore.getState().selectedRows).toEqual({ '0': true });
    });
  });

  describe('setIsLoading', () => {
    it('updates isLoading', () => {
      useDockerApplicationStore.getState().setIsLoading(false);

      expect(useDockerApplicationStore.getState().isLoading).toBe(false);

      useDockerApplicationStore.getState().setIsLoading(true);

      expect(useDockerApplicationStore.getState().isLoading).toBe(true);
    });
  });

  describe('updateContainers', () => {
    it('replaces containers in state', () => {
      useDockerApplicationStore.getState().updateContainers([mockContainer] as never);

      expect(useDockerApplicationStore.getState().containers).toHaveLength(1);
      expect(useDockerApplicationStore.getState().containers[0].Id).toBe('123');
    });
  });

  describe('getContainers', () => {
    it('fetches containers and updates state on success', async () => {
      server.use(http.get('*/docker/containers', () => HttpResponse.json([mockContainer])));

      const result = await useDockerApplicationStore.getState().getContainers();

      expect(result).toHaveLength(1);
      expect(result[0].Id).toBe('123');
      expect(useDockerApplicationStore.getState().containers).toHaveLength(1);
      expect(useDockerApplicationStore.getState().isLoading).toBe(false);
    });

    it('returns empty array and sets error on failure', async () => {
      server.use(
        http.get('*/docker/containers', () =>
          HttpResponse.json({ message: 'docker.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      const result = await useDockerApplicationStore.getState().getContainers();

      expect(result).toEqual([]);
      expect(useDockerApplicationStore.getState().isLoading).toBe(false);
    });
  });

  describe('getContainerStatus', () => {
    it('returns container state when container is found', async () => {
      server.use(http.get('*/docker/containers', () => HttpResponse.json([mockContainer])));

      const status = await useDockerApplicationStore.getState().getContainerStatus('test-container');

      expect(status).toBe('running');
    });

    it('returns null when container is not found', async () => {
      server.use(http.get('*/docker/containers', () => HttpResponse.json([])));

      const status = await useDockerApplicationStore.getState().getContainerStatus('missing-container');

      expect(status).toBeNull();
    });

    it('returns null on request error', async () => {
      server.use(
        http.get('*/docker/containers', () =>
          HttpResponse.json({ message: 'error', statusCode: 500 }, { status: 500 }),
        ),
      );

      const status = await useDockerApplicationStore.getState().getContainerStatus('test-container');

      expect(status).toBeNull();
    });
  });

  describe('createAndRunContainer', () => {
    it('calls POST docker/containers and sets isLoading to false on success', async () => {
      server.use(http.post('*/docker/containers', () => HttpResponse.json({ success: true })));

      await useDockerApplicationStore.getState().createAndRunContainer({
        applicationName: 'mail',
        containers: [] as never,
        originalComposeConfig: '' as never,
      });

      expect(useDockerApplicationStore.getState().isLoading).toBe(false);
    });

    it('sets error state on failure', async () => {
      server.use(
        http.post('*/docker/containers', () =>
          HttpResponse.json({ message: 'create.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useDockerApplicationStore.getState().createAndRunContainer({
        applicationName: 'mail',
        containers: [] as never,
        originalComposeConfig: '' as never,
      });

      expect(useDockerApplicationStore.getState().isLoading).toBe(false);
    });
  });

  describe('runDockerCommand', () => {
    it('sends PUT for each container, shows toast, and refreshes containers', async () => {
      server.use(
        http.put('*/docker/containers/:name/:operation', () => HttpResponse.json({ success: true })),
        http.get('*/docker/containers', () => HttpResponse.json([mockContainer])),
      );

      await useDockerApplicationStore.getState().runDockerCommand(['test-container'], 'start');

      expect(toast.success).toHaveBeenCalledWith('docker.events.startContainer');
      expect(useDockerApplicationStore.getState().containers).toHaveLength(1);
      expect(useDockerApplicationStore.getState().isLoading).toBe(false);
    });

    it('handles errors without crashing', async () => {
      server.use(
        http.put('*/docker/containers/:name/:operation', () =>
          HttpResponse.json({ message: 'run.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useDockerApplicationStore.getState().runDockerCommand(['test-container'], 'start');

      expect(useDockerApplicationStore.getState().isLoading).toBe(false);
    });
  });

  describe('deleteDockerContainer', () => {
    it('sends DELETE for each container and shows toast per container', async () => {
      server.use(
        http.delete('*/docker/containers/:name', () => HttpResponse.json({ success: true })),
        http.get('*/docker/containers', () => HttpResponse.json([])),
      );

      await useDockerApplicationStore.getState().deleteDockerContainer(['test-container']);

      expect(toast.success).toHaveBeenCalledWith('docker.events.containerDeleted');
      expect(useDockerApplicationStore.getState().isLoading).toBe(false);
    });

    it('handles errors without crashing', async () => {
      server.use(
        http.delete('*/docker/containers/:name', () =>
          HttpResponse.json({ message: 'delete.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useDockerApplicationStore.getState().deleteDockerContainer(['test-container']);

      expect(useDockerApplicationStore.getState().isLoading).toBe(false);
    });
  });

  describe('getDockerContainerConfig', () => {
    it('fetches YAML from GitHub, parses it, and sets dockerContainerConfig', async () => {
      const mockCompose = { services: { app: { image: 'test:latest' } } };
      mockAxiosGet.mockResolvedValue({ data: JSON.stringify(mockCompose) });

      const result = await useDockerApplicationStore.getState().getDockerContainerConfig('mail', 'edulution-mail');

      expect(mockAxiosGet).toHaveBeenCalledWith(
        expect.stringContaining('mail/edulution-mail/docker-compose.yml'),
        expect.any(Object),
      );
      expect(result).toEqual(mockCompose);
      expect(useDockerApplicationStore.getState().dockerContainerConfig).toEqual(mockCompose);
      expect(useDockerApplicationStore.getState().dockerComposeFiles['edulution-mail']).toBe(
        JSON.stringify(mockCompose),
      );
      expect(useDockerApplicationStore.getState().isLoading).toBe(false);
    });

    it('returns empty services and sets error on failure', async () => {
      mockAxiosGet.mockRejectedValue(new Error('network error'));

      const result = await useDockerApplicationStore.getState().getDockerContainerConfig('mail', 'edulution-mail');

      expect(result).toEqual({ services: {} });
      expect(useDockerApplicationStore.getState().isLoading).toBe(false);
    });
  });

  describe('getTraefikConfig', () => {
    it('fetches YAML from GitHub and sets traefikConfig on 200', async () => {
      const mockTraefik = { http: { routers: {} } };
      mockAxiosGet.mockResolvedValue({ status: 200, data: JSON.stringify(mockTraefik) });

      await useDockerApplicationStore.getState().getTraefikConfig('mail', 'edulution-mail');

      expect(useDockerApplicationStore.getState().traefikConfig).toEqual(mockTraefik);
      expect(useDockerApplicationStore.getState().isLoading).toBe(false);
    });

    it('sets traefikConfig to null on 404 response', async () => {
      mockAxiosGet.mockResolvedValue({ status: 404, data: '' });

      await useDockerApplicationStore.getState().getTraefikConfig('mail', 'edulution-mail');

      expect(useDockerApplicationStore.getState().traefikConfig).toBeNull();
      expect(useDockerApplicationStore.getState().isLoading).toBe(false);
    });

    it('sets traefikConfig to null and handles non-404 errors', async () => {
      const axiosError = Object.assign(new Error('server error'), {
        isAxiosError: true,
        response: { status: 500 },
      });
      mockAxiosGet.mockRejectedValue(axiosError);

      const { isAxiosError } = await import('axios');
      (isAxiosError as ReturnType<typeof vi.fn>).mockReturnValueOnce(true);

      await useDockerApplicationStore.getState().getTraefikConfig('mail', 'edulution-mail');

      expect(useDockerApplicationStore.getState().traefikConfig).toBeNull();
      expect(useDockerApplicationStore.getState().isLoading).toBe(false);
    });
  });

  describe('updateContainer', () => {
    it('sends PATCH and shows up-to-date toast when image is not updated', async () => {
      server.use(http.patch('*/docker/containers/:name', () => HttpResponse.json({ isImageUpdated: false })));

      await useDockerApplicationStore.getState().updateContainer(['test-container']);

      expect(toast.info).toHaveBeenCalledWith('docker.events.containerAlreadyUpToDate');
      expect(useDockerApplicationStore.getState().isLoading).toBe(false);
    });

    it('sends PATCH and shows success toast when image is updated', async () => {
      server.use(http.patch('*/docker/containers/:name', () => HttpResponse.json({ isImageUpdated: true })));

      await useDockerApplicationStore.getState().updateContainer(['test-container']);

      expect(toast.success).toHaveBeenCalledWith('docker.events.containerUpdateSuccessful');
      expect(useDockerApplicationStore.getState().isLoading).toBe(false);
    });

    it('handles errors without crashing', async () => {
      server.use(
        http.patch('*/docker/containers/:name', () =>
          HttpResponse.json({ message: 'patch.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useDockerApplicationStore.getState().updateContainer(['test-container']);

      expect(useDockerApplicationStore.getState().isLoading).toBe(false);
    });
  });

  describe('fetchTableContent', () => {
    it('fetches docker config and containers for a known application', async () => {
      const mockCompose = { services: { app: { image: 'test:latest' } } };
      mockAxiosGet.mockResolvedValue({ data: JSON.stringify(mockCompose) });

      server.use(http.get('*/docker/containers', () => HttpResponse.json([mockContainer])));

      await useDockerApplicationStore.getState().fetchTableContent('mail');

      expect(useDockerApplicationStore.getState().tableContentData).toHaveLength(1);
      expect(useDockerApplicationStore.getState().traefikConfig).toBeNull();
    });

    it('does nothing when applicationName is undefined', async () => {
      await useDockerApplicationStore.getState().fetchTableContent(undefined as never);

      expect(mockAxiosGet).not.toHaveBeenCalled();
    });

    it('does nothing for unknown application names', async () => {
      await useDockerApplicationStore.getState().fetchTableContent('unknown-app' as never);

      expect(mockAxiosGet).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('resets all state to initial values', () => {
      useDockerApplicationStore.setState({
        containers: [mockContainer] as never,
        selectedRows: { '0': true },
        isLoading: false,
        dockerContainerConfig: { services: {} } as never,
        traefikConfig: { http: {} } as never,
        dockerComposeFiles: { 'edulution-mail': 'yaml-content' },
      });

      useDockerApplicationStore.getState().reset();

      const state = useDockerApplicationStore.getState();
      expect(state.containers).toEqual([]);
      expect(state.selectedRows).toEqual({});
      expect(state.isLoading).toBe(true);
      expect(state.dockerContainerConfig).toBeNull();
      expect(state.traefikConfig).toBeNull();
      expect(state.dockerComposeFiles).toEqual({});
      expect(state.error).toBeNull();
    });
  });
});
