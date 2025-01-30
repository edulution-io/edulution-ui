import React from 'react';
import cn from '@libs/common/utils/className';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import useMenuBarConfig from '@/hooks/useMenuBarConfig';
import FloatingButtonsBarProps from '@libs/ui/types/FloatingButtons/floatingButtonsProps';

import { FLOATING_BUTTONS_BAR_ID } from '@libs/common/constants/pageElementIds';

const DesktopButtonsBar: React.FC<FloatingButtonsBarProps> = (props) => {
  const { config } = props;
  const { buttons, keyPrefix } = config;

  const menuBar = useMenuBarConfig();

  const floatingButtons = buttons.map((conf, index) => {
    const {
      icon,
      text,
      onClick,
      isVisible = true,
      variant = 'button',
      options = undefined,
      onSelectFileSelect = undefined,
    } = conf;
    return isVisible ? (
      // eslint-disable-next-line react/no-array-index-key
      <div key={`${keyPrefix}${index}`}>
        <FloatingActionButton
          variant={variant}
          icon={icon}
          text={text}
          onClick={onClick}
          options={options}
          onSelectFileSelect={onSelectFileSelect}
        />
      </div>
    ) : null;
  });
  return (
    <div
      id={FLOATING_BUTTONS_BAR_ID}
      className={cn(
        'fixed bottom-8 right-[var(--sidebar-width)] px-4',
        { 'left-0': menuBar.disabled },
        { 'left-64': !menuBar.disabled },
      )}
    >
      <div className="flex flex-grow-0 flex-wrap justify-start overflow-y-auto text-background">{floatingButtons}</div>
    </div>
  );
};

export default DesktopButtonsBar;
