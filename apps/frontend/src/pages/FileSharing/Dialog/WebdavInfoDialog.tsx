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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import replaceIpWithOrigin from '@libs/filesharing/utils/replaceIpWithOrigin';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useVariableSharePathname from '@/pages/FileSharing/hooks/useVariableSharePathname';
import useUserStore from '@/store/UserStore/useUserStore';
import WebdavInfoDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/WebdavInfoDialogBody';

interface WebdavInfoDialogProps {
  isOpen: boolean;
  handleClose: () => void;
}

const WebdavInfoDialog: React.FC<WebdavInfoDialogProps> = ({ isOpen, handleClose }) => {
  const { t } = useTranslation();
  const { webdavShare } = useParams();
  const { webdavShares } = useFileSharingStore();
  const { user } = useUserStore();
  const { createVariableSharePathname } = useVariableSharePathname();

  const currentShare = webdavShares.find((s) => s.displayName === webdavShare);
  const resolvedVariables = currentShare
    ? createVariableSharePathname(currentShare.sharePath, currentShare.pathVariables)
    : '';
  const baseUrl = replaceIpWithOrigin(`${currentShare?.url || ''}${resolvedVariables}`);

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={handleClose}
      title={t('filesharing.webdavInfo.title')}
      body={
        <WebdavInfoDialogBody
          baseUrl={baseUrl}
          username={user?.username || ''}
        />
      }
      desktopContentClassName="max-w-[500px]"
    />
  );
};

export default WebdavInfoDialog;
