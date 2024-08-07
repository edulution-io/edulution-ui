import React, { useMemo } from 'react';
import cn from '@/lib/utils';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import FloatingButtonsBarConfig from '@libs/common/types/floatingButtonsBarConfig';
import useMenuBarConfig from '@/hooks/useMenuBarConfig';

type FloatingButtonsBarProps = {
  config: FloatingButtonsBarConfig;
};

const FloatingButtonsBarForDesktop = (props: FloatingButtonsBarProps) => {
  const { config } = props;
  const { buttons, keyPrefix } = config;

  const menuBar = useMenuBarConfig();

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
    <div
      className={cn(
        'fixed bottom-8 right-[var(--sidebar-width)] p-4',
        { 'left-0': menuBar.disabled },
        { 'left-[256px]': !menuBar.disabled },
      )}
    >
      <div className="flex-basis-0 flex flex-grow-0 flex-wrap justify-start overflow-y-auto">{floatingButtons}</div>
    </div>
  );
};

export default FloatingButtonsBarForDesktop;
