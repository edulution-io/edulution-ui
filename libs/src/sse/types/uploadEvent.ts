import SseEventType from '@libs/sse/types/sseEventType';
import { MessageEvent } from '@nestjs/common';

interface UploadEvent extends MessageEvent {
  data: {
    message: string;
    eventType: SseEventType;
    percentCompleted?: number;
  };
}

export default UploadEvent;
