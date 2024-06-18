import { SidebarMenuItem } from './sidebarMenuItem';

export type SidebarProps = {
  translate: number;
  isUpButtonVisible: boolean;
  isDownButtonVisible: boolean;
  sidebarItems: SidebarMenuItem[];
  handleUpButtonClick: () => void;
  handleDownButtonClick: () => void;
  handleWheel: (event: WheelEvent) => void;
  handleTouchStart: (event: TouchEvent) => void;
  handleTouchMove: (event: TouchEvent) => void;
  handleTouchEnd: (event: TouchEvent) => void;
};
