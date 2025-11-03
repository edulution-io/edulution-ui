/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
