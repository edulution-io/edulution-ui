import React from 'react';
import FloatingButtonsBarConfig from '@libs/common/types/floatingButtonsBarConfig';
import useIsMobileView from '@/hooks/useIsMobileView';
import FloatingButtonsBarForMobile from '@/components/shared/FloatingsButtonsBarForMobile';
import FloatingButtonsBarForDesktop from '@/components/shared/FloatingsButtonsBarForDesktop';

type FloatingButtonsBarProps = {
  config: FloatingButtonsBarConfig;
};

const FloatingButtonsBar = (props: FloatingButtonsBarProps) => {
  const isMobileView = useIsMobileView();

  return isMobileView ? (
    <FloatingButtonsBarForMobile {...props} />
  ) : (
    <FloatingButtonsBarForDesktop {...props} />
  );
};

export default FloatingButtonsBar;
