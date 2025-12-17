import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import AttendeeDto from '@libs/user/types/attendee.dto';

interface McpConfigDto {
  id: string;
  name: string;
  url: string;
  allowedUsers: AttendeeDto[];
  allowedGroups: MultipleSelectorGroup[];
}

export default McpConfigDto;
