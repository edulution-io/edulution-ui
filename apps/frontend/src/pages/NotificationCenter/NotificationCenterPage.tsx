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
