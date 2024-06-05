type SidebarMenuItem = {
  title: string;
  link: string;
  icon: string;
  color: string;
};

export interface SidebarProps {
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
}
