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

import React, { FC } from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import useWebdavServerConfigTableStore from './useWebdavServerConfigTableStore';
import useWebdavShareConfigTableStore from './useWebdavShareConfigTableStore';

const DeleteWebdavServerWarningDialog: FC = () => {
  const { t } = useTranslation();
  const { tableContentData: webdavShares } = useWebdavShareConfigTableStore();
  const {
    isDeleteWebdavServerWarningDialogOpen,
    tableContentData: webdavServers,
    setIsDeleteWebdavServerWarningDialogOpen,
  } = useWebdavServerConfigTableStore();
  const dependentShares = webdavShares.filter((share) => share.rootServer === isDeleteWebdavServerWarningDialogOpen);
  const shareNames = dependentShares.map((share) => share.displayName).join(', ');
  const serverName = webdavServers.find((server) => server.webdavShareId === isDeleteWebdavServerWarningDialogOpen);

  const getDialogBody = () => (
    <p>
      {t('settings.appconfig.sections.webdavServer.deleteWarning.description', {
        serverName: serverName?.displayName,
        count: dependentShares.length,
        shares: shareNames,
      })}
    </p>
  );

  const getDialogFooter = () => (
    <DialogFooterButtons
      cancelButtonText={t('common.close')}
      handleClose={() => setIsDeleteWebdavServerWarningDialogOpen(undefined)}
    />
  );

  return (
    <AdaptiveDialog
      title={t('settings.appconfig.sections.webdavServer.deleteWarning.title')}
      body={getDialogBody()}
      footer={getDialogFooter()}
      isOpen={!!isDeleteWebdavServerWarningDialogOpen}
      handleOpenChange={() => setIsDeleteWebdavServerWarningDialogOpen(undefined)}
    />
  );
};

export default DeleteWebdavServerWarningDialog;
