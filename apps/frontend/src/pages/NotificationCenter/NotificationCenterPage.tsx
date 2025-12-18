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
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/structure/layout/PageLayout';
import PageTitle from '@/components/PageTitle';
import { Dashboard } from '@/assets/icons';
import CreateNewAnnouncementDialog from '@/pages/NotificationCenter/components/CreateNewAnnouncementDialog';
import NotificationCenterFloatingButtonsBar from '@/pages/NotificationCenter/components/NotificationCenterFloatingButtonsBar';
import useNotificationCenterStore from '@/pages/NotificationCenter/useNotificationCenterStore';
import CreatedAnnouncementsTable from '@/pages/NotificationCenter/components/CreatedAnnouncementsTable';
import DeleteAnnouncementsDialog from '@/pages/NotificationCenter/components/DeleteAnnouncementsDialog';

const NotificationCenterPage = () => {
  const { t } = useTranslation();
  const { isDialogOpen, setIsDialogOpen, fetchCreatedAnnouncements } = useNotificationCenterStore();

  useEffect(() => {
    void fetchCreatedAnnouncements();
  }, []);

  return (
    <PageLayout
      nativeAppHeader={{
        title: t('notificationcenter.sidebar'),
        description: t('notificationcenter.description'),
        iconSrc: Dashboard,
      }}
    >
      <PageTitle translationId="notificationcenter.sidebar" />
      <CreatedAnnouncementsTable />
      <NotificationCenterFloatingButtonsBar />
      <CreateNewAnnouncementDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
      <DeleteAnnouncementsDialog />
    </PageLayout>
  );
};

export default NotificationCenterPage;
