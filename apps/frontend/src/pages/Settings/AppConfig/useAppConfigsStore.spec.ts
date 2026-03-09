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
vi.mock('@libs/common/utils/getBase64String', () => ({
  decodeBase64: (data: string) => `decoded:${data}`,
}));

import { toast } from 'sonner';
import { http, HttpResponse } from 'msw';
import server from '@libs/test-utils/msw/server';
import eduApi from '@/api/eduApi';
import useAppConfigsStore from './useAppConfigsStore';

const mockAppConfig = {
  name: 'test-app',
  icon: 'icon.png',
  appType: 'native',
  options: {},
  accessGroups: [],
  extendedOptions: {},
  position: 1,
};

const initialStoreState = useAppConfigsStore.getState();

describe('useAppConfigsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAppConfigsStore.setState(initialStoreState, true);
  });

  describe('getAppConfigs', () => {
    it('populates appConfigs on success', async () => {
      server.use(
        http.get('/edu-api/appconfig', () =>
          HttpResponse.json([mockAppConfig, { ...mockAppConfig, name: 'test-app-2' }]),
        ),
      );

      await useAppConfigsStore.getState().getAppConfigs();

      const state = useAppConfigsStore.getState();
      expect(state.appConfigs).toHaveLength(2);
      expect(state.isGetAppConfigsLoading).toBe(false);
    });

    it('sets error state on failure', async () => {
      server.use(
        http.get('/edu-api/appconfig', () =>
          HttpResponse.json({ message: 'appconfig.get.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useAppConfigsStore.getState().getAppConfigs();

      expect(useAppConfigsStore.getState().isGetAppConfigsLoading).toBe(false);
      expect(useAppConfigsStore.getState().error).toBeTruthy();
    });
  });

  describe('getPublicAppConfigs', () => {
    it('populates publicAppConfigs on success', async () => {
      server.use(http.get('/edu-api/appconfig/public', () => HttpResponse.json([mockAppConfig])));

      await useAppConfigsStore.getState().getPublicAppConfigs();

      expect(useAppConfigsStore.getState().publicAppConfigs).toHaveLength(1);
      expect(useAppConfigsStore.getState().isGetPublicAppConfigsLoading).toBe(false);
    });
  });

  describe('createAppConfig', () => {
    it('updates appConfigs and shows toast on success', async () => {
      server.use(
        http.post('/edu-api/appconfig', () =>
          HttpResponse.json([mockAppConfig, { ...mockAppConfig, name: 'new-app' }]),
        ),
      );

      await useAppConfigsStore.getState().createAppConfig(mockAppConfig as never);

      expect(useAppConfigsStore.getState().appConfigs).toHaveLength(2);
      expect(toast.success).toHaveBeenCalledWith('settings.appconfig.update.success');
      expect(useAppConfigsStore.getState().isLoading).toBe(false);
    });
  });

  describe('updateAppConfig', () => {
    it('updates appConfigs and shows toast on success', async () => {
      server.use(http.put('/edu-api/appconfig/:name', () => HttpResponse.json([mockAppConfig])));

      await useAppConfigsStore.getState().updateAppConfig(mockAppConfig as never);

      expect(useAppConfigsStore.getState().appConfigs).toHaveLength(1);
      expect(toast.success).toHaveBeenCalledWith('settings.appconfig.update.success');
    });
  });

  describe('patchSingleFieldInConfig', () => {
    it('updates appConfigs and shows toast on success', async () => {
      server.use(http.patch('/edu-api/appconfig/:name', () => HttpResponse.json([mockAppConfig])));

      await useAppConfigsStore.getState().patchSingleFieldInConfig('test-app', {
        field: 'icon',
        value: 'new-icon.png',
      } as never);

      expect(toast.success).toHaveBeenCalledWith('settings.appconfig.update.success');
      expect(useAppConfigsStore.getState().isLoading).toBe(false);
    });
  });

  describe('deleteAppConfigEntry', () => {
    it('updates appConfigs and shows toast on success', async () => {
      server.use(http.delete('/edu-api/appconfig/:name', () => HttpResponse.json([])));

      await useAppConfigsStore.getState().deleteAppConfigEntry('test-app');

      expect(useAppConfigsStore.getState().appConfigs).toEqual([]);
      expect(toast.success).toHaveBeenCalledWith('settings.appconfig.delete.success');
    });
  });

  describe('getConfigFile', () => {
    it('returns decoded file content on success', async () => {
      server.use(http.get('/edu-api/appconfig/proxyconfig', () => HttpResponse.json('base64content')));

      const result = await useAppConfigsStore.getState().getConfigFile('/path/to/config');

      expect(result).toBe('decoded:base64content');
      expect(useAppConfigsStore.getState().isConfigFileLoading).toBe(false);
    });

    it('returns empty string on error', async () => {
      server.use(
        http.get('/edu-api/appconfig/proxyconfig', () =>
          HttpResponse.json({ message: 'config.file.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      const result = await useAppConfigsStore.getState().getConfigFile('/path/to/config');

      expect(result).toBe('');
      expect(useAppConfigsStore.getState().isConfigFileLoading).toBe(false);
    });
  });

  describe('uploadFile', () => {
    it('returns file path on success', async () => {
      const postSpy = vi.spyOn(eduApi, 'post').mockResolvedValueOnce({ data: 'icons/uploaded.png' });

      const file = new File(['test'], 'icon.png', { type: 'image/png' });
      const result = await useAppConfigsStore.getState().uploadFile('test-app', file);

      expect(result).toBe('icons/uploaded.png');
      expect(useAppConfigsStore.getState().isLoading).toBe(false);

      postSpy.mockRestore();
    });

    it('returns undefined on error', async () => {
      const postSpy = vi.spyOn(eduApi, 'post').mockRejectedValueOnce(new Error('upload failed'));

      const file = new File(['test'], 'icon.png', { type: 'image/png' });
      const result = await useAppConfigsStore.getState().uploadFile('test-app', file);

      expect(result).toBeUndefined();
      expect(useAppConfigsStore.getState().isLoading).toBe(false);

      postSpy.mockRestore();
    });
  });

  describe('dialog state setters', () => {
    it('setIsAddAppConfigDialogOpen updates state', () => {
      useAppConfigsStore.getState().setIsAddAppConfigDialogOpen(true);
      expect(useAppConfigsStore.getState().isAddAppConfigDialogOpen).toBe(true);
    });

    it('setIsDeleteAppConfigDialogOpen updates state', () => {
      useAppConfigsStore.getState().setIsDeleteAppConfigDialogOpen(true);
      expect(useAppConfigsStore.getState().isDeleteAppConfigDialogOpen).toBe(true);
    });

    it('setIsEditIconDialogOpen updates state', () => {
      useAppConfigsStore.getState().setIsEditIconDialogOpen(true);
      expect(useAppConfigsStore.getState().isEditIconDialogOpen).toBe(true);
    });
  });

  describe('reset', () => {
    it('returns state to initial values but preserves publicAppConfigs', () => {
      useAppConfigsStore.setState({
        isAddAppConfigDialogOpen: true,
        isDeleteAppConfigDialogOpen: true,
        isEditIconDialogOpen: true,
        publicAppConfigs: [mockAppConfig] as never,
      });

      useAppConfigsStore.getState().reset();

      const state = useAppConfigsStore.getState();
      expect(state.isAddAppConfigDialogOpen).toBe(false);
      expect(state.isDeleteAppConfigDialogOpen).toBe(false);
      expect(state.isEditIconDialogOpen).toBe(false);
      expect(state.publicAppConfigs).toHaveLength(1);
      expect(state.isLoading).toBe(false);
    });
  });
});
