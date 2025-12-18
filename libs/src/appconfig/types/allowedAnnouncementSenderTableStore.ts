import AllowedSenderDto from '@libs/notification-center/types/allowedSenderDto';
import AppConfigTable from '@libs/appconfig/types/appConfigTable';

interface AllowedAnnouncementSenderTableStore extends AppConfigTable<AllowedSenderDto> {
  setTableContentData: (data: AllowedSenderDto[]) => Promise<void> | void;
  setSelectedRows: (rows: Record<string, boolean>) => void;
  deleteTableEntry: (appName: string, id: string) => Promise<void>;
  canCreate: boolean;
  isCanCreateLoading: boolean;
  fetchCanCreate: () => Promise<void>;
}

export default AllowedAnnouncementSenderTableStore;
