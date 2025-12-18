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

import React, { useEffect } from 'react';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import CreateButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/createButton';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import useNotificationCenterStore from '@/pages/NotificationCenter/useNotificationCenterStore';
import useAllowedSenderTableStore from '@/pages/Settings/AppConfig/notificationcenter/useAllowedSenderTableStore';
import CopyButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/copyButton';
import ReloadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/reloadButton';

const NotificationCenterFloatingButtonsBar: React.FC = () => {
  const {
    setIsDialogOpen,
    setIsDeleteDialogOpen,
    selectedRows,
    createdAnnouncements,
    setSelectedAnnouncement,
    fetchCreatedAnnouncements,
  } = useNotificationCenterStore();
  const { canCreate, fetchCanCreate } = useAllowedSenderTableStore();

  useEffect(() => {
    void fetchCanCreate();
  }, []);

  const selectedRowIds = Object.keys(selectedRows).filter((key) => selectedRows[key]);
  const hasSelectedRows = selectedRowIds.length > 0;
  const onlyOneSelectedRow = selectedRowIds.length === 1;

  const handleDuplicateClick = () => {
    const selectedAnnouncement = createdAnnouncements.find(
      (announcementDto) => announcementDto.id === selectedRowIds[0],
    );
    if (selectedAnnouncement) {
      setSelectedAnnouncement(selectedAnnouncement);
      setIsDialogOpen(true);
    }
  };

  const handleCreateClick = () => {
    setSelectedAnnouncement(null);
    setIsDialogOpen(true);
  };

  const config: FloatingButtonsBarConfig = {
    buttons: [
      CreateButton(handleCreateClick, canCreate),
      CopyButton(() => handleDuplicateClick(), onlyOneSelectedRow),
      DeleteButton(() => setIsDeleteDialogOpen(true), hasSelectedRows),
      ReloadButton(() => {
        void fetchCreatedAnnouncements();
      }),
    ],
    keyPrefix: 'notification-center-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default NotificationCenterFloatingButtonsBar;
