import HistoryEntryDto from '@libs/whiteboard/types/historyEntryDto';

class HistoryPageDto {
  roomId: string;
  page: number;
  limit: number;
  total: number;
  items: HistoryEntryDto[];
}

export default HistoryPageDto;
