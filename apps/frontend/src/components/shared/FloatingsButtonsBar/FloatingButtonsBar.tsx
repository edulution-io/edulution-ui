import React from 'react';
import useIsMobileView from '@/hooks/useIsMobileView';
import useIsMidSizeView from '@/hooks/useIsMidSizeView';
import MobileButtonsBar from '@/components/shared/FloatingsButtonsBar/MobileButtonsBar';
import DesktopButtonsBar from '@/components/shared/FloatingsButtonsBar/DesktopButtonsBar';
import FloatingButtonsBarProps from '@libs/ui/types/FloatingButtons/floatingButtonsProps';

const FloatingButtonsBar: React.FC<FloatingButtonsBarProps> = (props) => {
  const isMobileView = useIsMobileView();
  const isMidSizeView = useIsMidSizeView();

  return isMobileView || isMidSizeView ? <MobileButtonsBar {...props} /> : <DesktopButtonsBar {...props} />;
};

export default FloatingButtonsBar;
