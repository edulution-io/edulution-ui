import SseMessageType from '@libs/common/types/sseMessageType';
import SseEventData from './sseEventData';

type SseEvent = {
  username: string;
  type: SseMessageType;
  data: SseEventData;
};

export default SseEvent;
