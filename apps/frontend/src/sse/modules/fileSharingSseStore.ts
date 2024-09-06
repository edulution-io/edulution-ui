import UploadEvent from '@libs/sse/types/uploadEvent';
import { StateCreator } from 'zustand';

type FileSharingState = {
  uploadStatus: number | undefined;
  connectFileSharingSseEvent: (eventType: string) => void;
  setUploadStatus: (status: number) => void;
};

const createFileSharingSseStore: StateCreator<FileSharingState> = (set) => ({
  uploadStatus: 0,

  connectFileSharingSseEvent: (eventType) => {
    const eventSource = new EventSource('http://localhost:5173/edu-api/sse');

    eventSource.addEventListener(eventType, (event: MessageEvent) => {
      try {
        const { data } = event as UploadEvent; // Ensure the event data is parsed correctly

        // Handle specific event type, for example, upload progress
        if (data.percentCompleted !== undefined) {
          set({ uploadStatus: data.percentCompleted });
        }
      } catch (error) {
        console.error('Error parsing event data', error);
      }
    });
  },

  setUploadStatus: (status: number) => {
    set({ uploadStatus: status });
  },
});

export default createFileSharingSseStore;
