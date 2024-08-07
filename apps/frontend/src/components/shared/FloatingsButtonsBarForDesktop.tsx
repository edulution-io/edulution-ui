import React, { useMemo } from 'react';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import FloatingButtonsBarConfig from '@libs/common/types/floatingButtonsBarConfig';

type FloatingButtonsBarProps = {
  config: FloatingButtonsBarConfig;
};

const FloatingButtonsBarForDesktop = (props: FloatingButtonsBarProps) => {
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
    <div className="fixed bottom-8 left-0 right-[var(--sidebar-width)] p-4">
      <div className="flex-basis-0 flex flex-grow-0 flex-wrap justify-start overflow-y-auto">{floatingButtons}</div>
    </div>
  );
};

export default FloatingButtonsBarForDesktop;
