import SseEventType from '@libs/sse/types/sseEventType';

interface UploadEvent {
  message: string;
  eventType: SseEventType;
  percentCompleted?: number;
}

export default UploadEvent;
