interface DndTimeWindow {
  id: string;
  label: string;
  days: number[];
  startTime: string;
  endTime: string;
  bufferNotifications: boolean;
}

export default DndTimeWindow;
