import React, { useMemo } from 'react';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import FloatingButtonsBarConfig from '@/components/shared/FloatingButtons/floating-buttons-bar-config';

type FloatingButtonsBarProps = {
  config: FloatingButtonsBarConfig;
};

const FloatingButtonsBar = (props: FloatingButtonsBarProps) => {
  const { config } = props;
  const { buttons, keyPrefix } = config;

  const floatingButtons = useMemo(
    () =>
      buttons.map((conf, index) => {
        const { icon, text, onClick, isVisible = true } = conf;
        return isVisible ? (
          // eslint-disable-next-line react/no-array-index-key
          <div key={`${keyPrefix}${index}`}>
            <FloatingActionButton
              icon={icon}
              text={text}
              onClick={onClick}
            />
          </div>
        ) : null;
      }),
    [config],
  );

  return (
    <div className="w-65% relative max-w-[65%]">
      <div className="flex-basis-0 no-wrap fixed bottom-8 flex max-w-[inherit] flex-grow-0 overflow-y-scroll">
        {floatingButtons}
      </div>
    </div>
  );
};

export default FloatingButtonsBar;
