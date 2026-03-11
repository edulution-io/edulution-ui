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

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import WEBHOOK_CONSTANTS from '@libs/webhook/constants/webhookConstants';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import { DropdownSelect } from '@/components';
import useWebhookClientsStore from './useWebhookClientsStore';

const USER_AGENT_OPTIONS = WEBHOOK_CONSTANTS.USER_AGENT_OPTIONS.map((agent) => ({
  id: agent,
  name: agent,
}));

const AddWebhookClientDialog: React.FC = () => {
  const { t } = useTranslation();
  const { isAddDialogOpen, setIsAddDialogOpen, createClient, isLoading } = useWebhookClientsStore();
  const [selectedUserAgent, setSelectedUserAgent] = useState<string>(WEBHOOK_CONSTANTS.USER_AGENT_OPTIONS[0]);

  const handleSubmit = () => {
    void createClient(selectedUserAgent);
  };

  const handleClose = () => {
    setIsAddDialogOpen(false);
  };

  return (
    <AdaptiveDialog
      isOpen={isAddDialogOpen}
      handleOpenChange={handleClose}
      title={t('settings.webhooks.addClient')}
      body={
        <div className="space-y-4 py-4">
          <p className="font-bold">{t('settings.webhooks.selectUserAgent')}</p>
          <DropdownSelect
            options={USER_AGENT_OPTIONS}
            selectedVal={selectedUserAgent}
            handleChange={setSelectedUserAgent}
            translate={false}
          />
        </div>
      }
      footer={
        <DialogFooterButtons
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          submitButtonText={t('common.create')}
          disableSubmit={isLoading}
        />
      }
    />
  );
};

export default AddWebhookClientDialog;
