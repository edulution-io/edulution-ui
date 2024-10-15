type SseEvent = {
  username: string;
  data: {
    message: string;
  };
};

export default SseEvent;
