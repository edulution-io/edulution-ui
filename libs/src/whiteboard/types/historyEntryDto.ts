import UserDto from '@libs/user/types/user.dto';

class HistoryEntryDto {
  id: string;
  roomId: string;
  attendee: Pick<UserDto, 'firstName' | 'lastName' | 'username'>;
  message: Record<string, unknown>;
  createdAt: Date;
}

export default HistoryEntryDto;
