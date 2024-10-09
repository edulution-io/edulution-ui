import React from 'react';
import useIsMobileView from '@/hooks/useIsMobileView';
import MobileButtonsBar from '@/components/shared/FloatingsButtonsBar/MobileButtonsBar';
import DesktopButtonsBar from '@/components/shared/FloatingsButtonsBar/DesktopButtonsBar';
import FloatingButtonsBarProps from '@libs/ui/types/FloatingButtons/floatingButtonsProps';

const FloatingButtonsBar: React.FC<FloatingButtonsBarProps> = (props) => {
  const isMobileView = useIsMobileView();

  return isMobileView ? <MobileButtonsBar {...props} /> : <DesktopButtonsBar {...props} />;
};

export default FloatingButtonsBar;
