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

import { create } from 'zustand';
import { RowSelectionState } from '@tanstack/react-table';
import { toast } from 'sonner';
import i18n from '@/i18n';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { WEBHOOK_CLIENTS_ENDPOINT } from '@libs/webhook/constants/webhookApiEndpoint';
import type WebhookClientDto from '@libs/webhook/types/webhookClientDto';

type WebhookClientsStore = {
  clients: WebhookClientDto[];
  selectedRows: RowSelectionState;
  isLoading: boolean;
  isAddDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  setSelectedRows: (rows: RowSelectionState) => void;
  setIsAddDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  fetchClients: () => Promise<void>;
  createClient: (userAgent: string) => Promise<void>;
  deleteClients: (ids: string[]) => Promise<void>;
  reset: () => void;
};

const initialValues = {
  clients: [],
  selectedRows: {},
  isLoading: false,
  isAddDialogOpen: false,
  isDeleteDialogOpen: false,
};

const useWebhookClientsStore = create<WebhookClientsStore>()((set) => ({
  ...initialValues,

  setSelectedRows: (rows) => set({ selectedRows: rows }),
  setIsAddDialogOpen: (open) => set({ isAddDialogOpen: open }),
  setIsDeleteDialogOpen: (open) => set({ isDeleteDialogOpen: open }),

  fetchClients: async () => {
    set({ isLoading: true });
    try {
      const { data } = await eduApi.get<WebhookClientDto[]>(WEBHOOK_CLIENTS_ENDPOINT);
      set({ clients: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  createClient: async (userAgent) => {
    set({ isLoading: true });
    try {
      await eduApi.post(WEBHOOK_CLIENTS_ENDPOINT, { userAgent });
      const { data } = await eduApi.get<WebhookClientDto[]>(WEBHOOK_CLIENTS_ENDPOINT);
      set({ clients: data, isAddDialogOpen: false });
      toast.success(i18n.t('settings.webhooks.createSuccess'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteClients: async (ids) => {
    set({ isLoading: true });
    try {
      await Promise.all(ids.map((id) => eduApi.delete(`${WEBHOOK_CLIENTS_ENDPOINT}/${id}`)));
      const { data } = await eduApi.get<WebhookClientDto[]>(WEBHOOK_CLIENTS_ENDPOINT);
      set({ clients: data, selectedRows: {}, isDeleteDialogOpen: false });
      toast.success(i18n.t('settings.webhooks.deleteSuccess'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set(initialValues),
}));

export default useWebhookClientsStore;
