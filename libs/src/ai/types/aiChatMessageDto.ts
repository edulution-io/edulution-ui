import AiChatMessagePartDto from '@libs/ai/types/aiChatMessagePartDto';
import { AiRole } from '@libs/ai/types/aiRoleType';

interface AiChatMessageDto {
  id: string;
  role: AiRole;
  parts: AiChatMessagePartDto[];
}

export default AiChatMessageDto;
