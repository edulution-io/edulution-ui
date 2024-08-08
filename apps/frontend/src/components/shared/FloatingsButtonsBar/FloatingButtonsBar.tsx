import React from 'react';
import FloatingButtonsBarConfig from '@libs/common/types/floatingButtonsBarConfig';
import useIsMobileView from '@/hooks/useIsMobileView';
import MobileButtonsBar from '@/components/shared/FloatingsButtonsBar/MobileButtonsBar';
import DesktopButtonsBar from '@/components/shared/FloatingsButtonsBar/DesktopButtonsBar';

type FloatingButtonsBarProps = {
  config: FloatingButtonsBarConfig;
};

const FloatingButtonsBar = (props: FloatingButtonsBarProps) => {
  const isMobileView = useIsMobileView();

  return isMobileView ? <MobileButtonsBar {...props} /> : <DesktopButtonsBar {...props} />;
};

export default FloatingButtonsBar;
