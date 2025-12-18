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
