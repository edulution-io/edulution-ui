import React, { useEffect, useState } from 'react';
import { MdClose, MdMaximize, MdMinimize } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import cn from '@/lib/utils';
import useIsMobileView from '@/hooks/useIsMobileView';
import { Card } from './Card';
import { TooltipProvider } from '../ui/Tooltip';
import ActionTooltip from './ActionTooltip';

interface ControlPanelProps {
  isMinimized?: boolean;
  toggleMinimized?: () => void;
  onClose: () => void;
  showMinimize?: boolean;
  showClose?: boolean;
  label: string;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isMinimized,
  toggleMinimized,
  onClose,
  showMinimize = true,
  showClose = true,
  label,
}) => {
  const isMobileView = useIsMobileView();
  const { t } = useTranslation();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const existingPanels = document.querySelectorAll('div[data-key^="control-panel-"]');
    setOffset(existingPanels.length * 75);
  }, []);

  return (
    <div
      data-key={`control-panel-${label}`}
      style={{ left: `calc(50% + ${offset}px)` }}
      className={cn(
        'fixed top-0.5 z-10 flex -translate-x-1/2 transform items-center space-x-2',
        isMobileView && 'space-x-4',
      )}
    >
      {showMinimize && (
        <TooltipProvider>
          <ActionTooltip
            className="m-2 bg-ciLightGrey text-black"
            tooltipText={t(`${label}.sidebar`)}
            trigger={
              <Card
                variant="security"
                className="mr-1 bg-black px-2 py-1 text-sm hover:bg-blue-700"
                onClick={toggleMinimized}
              >
                {isMinimized ? (
                  <MdMaximize className="inline bg-ciLightGrey" />
                ) : (
                  <MdMinimize className="inline text-ciLightGrey" />
                )}
              </Card>
            }
          />
        </TooltipProvider>
      )}
      {showClose && (
        <TooltipProvider>
          <ActionTooltip
            className="m-2 bg-ciLightGrey text-black"
            tooltipText={t(`${label}.sidebar`)}
            trigger={
              <Card
                variant="security"
                className="bg-red mr-1 px-2 py-1 text-sm hover:bg-ciRed"
                onClick={onClose}
              >
                <MdClose className="bg-ciLightGre inline" />
              </Card>
            }
          />
        </TooltipProvider>
      )}
    </div>
  );
};

export default ControlPanel;
