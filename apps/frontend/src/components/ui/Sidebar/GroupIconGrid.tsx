import React from 'react';
import { SidebarMenuItem } from '@libs/ui/types/sidebar';
import { SIDEBAR_ICON_WIDTH } from '@libs/ui/constants/sidebar';
import InlineSvg from '@/components/shared/InlineSvg';

export const GroupIconGrid = ({ item }: { item: SidebarMenuItem }) => {
  const count = item.subItems?.length || 0;

  const gridSize = Math.ceil(Math.sqrt(count));

  const cellSize = SIDEBAR_ICON_WIDTH / gridSize;

  return (
    <div className="flex items-center space-x-4">
      <div
        className="group-icon-grid ml-[4px] grid overflow-hidden"
        style={{
          width: `${SIDEBAR_ICON_WIDTH}px`,
          height: `${SIDEBAR_ICON_WIDTH}px`,
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridAutoRows: `${cellSize}px`,
        }}
      >
        {item.subItems?.map((subItem) => (
          <InlineSvg
            key={`${subItem.title}-icon`}
            src={subItem.icon}
            className="grid-icon object-contain"
            aria-label={`${subItem.title} icon`}
          />
        ))}
      </div>

      <span className="font-semibold">{item.title}</span>
    </div>
  );
};
