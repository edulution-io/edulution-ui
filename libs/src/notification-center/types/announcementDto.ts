import { AnnouncementStatusType } from '@libs/notification-center/types/announcementStatusType';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { ChannelsType } from '@libs/notification-center/types/channelsType';

interface AnnouncementDto {
  id: string;
  title: string;
  pushMessage: string;
  extendedMessage?: string;
  channels: ChannelsType[];
  recipientGroups: MultipleSelectorGroup[];
  recipientUsers: AttendeeDto[];
  recipientsCount: number;
  creator: {
    firstName: string;
    lastName: string;
    username: string;
  };
  status: AnnouncementStatusType;
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default AnnouncementDto;
