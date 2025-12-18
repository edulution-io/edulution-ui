import { ChannelsType } from '@libs/notification-center/types/channelsType';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import AttendeeDto from '@libs/user/types/attendee.dto';

interface AnnouncementForm {
  title: string;
  pushMessage: string;
  extendedMessage?: string;
  recipientGroups: MultipleSelectorGroup[];
  recipientUsers: AttendeeDto[];
  channels: ChannelsType[];
}

export default AnnouncementForm;
