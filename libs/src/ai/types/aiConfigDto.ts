import { AiApiStandardType } from '@libs/ai/types/aiApiStandardType';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import AttendeeDto from '@libs/user/types/attendee.dto';
import { AiConfigPurposeType } from '@libs/ai/types/aiConfigPurposeType';

interface AiConfigDto {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  aiModel: string;
  apiStandard: AiApiStandardType;
  allowedUsers: AttendeeDto[];
  allowedGroups: MultipleSelectorGroup[];
  purposes: AiConfigPurposeType[];
}

export default AiConfigDto;
