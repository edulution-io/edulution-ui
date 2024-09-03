import { StateCreator } from 'zustand';
import UploadEvent from '@libs/sse/types/uploadEvent';

type FileSharingState = {
  uploadStatus: number | undefined;
  connectFileSharingSseEvent: (eventType: string) => void;
  setUploadStatus: (status: number) => void;
};

const createFileSharingSseStore: StateCreator<FileSharingState> = (set) => ({
  uploadStatus: 0, // Initial status

  connectFileSharingSseEvent: (eventType) => {
    const eventSource = new EventSource('http://localhost:5173/edu-api/sse');
    eventSource.addEventListener(eventType, (event) => {
      const data = event.data as UploadEvent;
      set({ uploadStatus: data.percentCompleted });
    });
  },

  setUploadStatus: (status: number) => {
    set({ uploadStatus: status });
  },
});

export default createFileSharingSseStore;
