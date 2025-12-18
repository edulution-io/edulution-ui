import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import AttendeeDto from '@libs/user/types/attendee.dto';

interface AllowedSenderDto {
  allowedSenderId: string;
  name: string;
  allowedGroups: MultipleSelectorGroup[];
  allowedUsers: AttendeeDto[];
}

export default AllowedSenderDto;
