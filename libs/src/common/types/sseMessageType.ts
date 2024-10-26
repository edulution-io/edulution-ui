import SSE_MESSAGE_TYPE from '../constants/sseMessageType';

type SseMessageType = (typeof SSE_MESSAGE_TYPE)[keyof typeof SSE_MESSAGE_TYPE];

export default SseMessageType;
