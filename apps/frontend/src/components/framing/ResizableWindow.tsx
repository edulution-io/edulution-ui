import React, { ReactNode, useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import useIsMobileView from '@/hooks/useIsMobileView';
import cn from '@libs/common/utils/className';
import useFrameStore from '@/components/framing/FrameStore';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import useWindowResize from '@/hooks/useWindowResize';

interface ResizableWindowProps {
  titleTranslationId: string;
  children?: ReactNode;
  handleClose: () => void;
  disableWindowControls?: boolean;
}

const ResizableWindow: React.FC<ResizableWindowProps> = ({
  titleTranslationId,
  children,
  handleClose,
  disableWindowControls = false,
}) => {
  const windowSize = useWindowResize();
  const isMobileView = useIsMobileView();
  const { t } = useTranslation();
  const { minimizedWindowedFrames, setWindowedFrameMinimized, setWindowedFrameOpen, openWindowedFrames } =
    useFrameStore();

  const [isMaximized, setIsMaximized] = useState(true);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [prevPosition, setPrevPosition] = useState(currentPosition);

  const isMinimized = minimizedWindowedFrames.includes(titleTranslationId);

  const calculateMaximizedWidth = () => {
    if (isMobileView) return `${window.innerWidth}px`;

    const sidebarWidth = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width') || '0',
    );

    return `${window.innerWidth - sidebarWidth}px`;
  };

  const [currentSize, setCurrentSize] = useState({ width: calculateMaximizedWidth(), height: '100vh' });
  const [prevSize, setPrevSize] = useState(currentSize);

  useEffect(() => {
    if (isMaximized && !isMinimized) {
      setCurrentSize({ width: calculateMaximizedWidth(), height: `${windowSize.height}px` });
    }
  }, [windowSize, isMaximized, isMinimized]);

  useEffect(() => {
    if (isMinimized) {
      const minimizedPositionIndex = minimizedWindowedFrames.indexOf(titleTranslationId);
      const calculatedPosition = minimizedPositionIndex * 300;

      setCurrentPosition({ x: calculatedPosition, y: window.innerHeight - 29 });
    }
  }, [minimizedWindowedFrames, isMinimized, titleTranslationId]);

  const savePreviousValues = () => {
    setPrevSize(currentSize);
    setPrevPosition(currentPosition);
  };

  const minimizeWindow = () => {
    setWindowedFrameMinimized(titleTranslationId, true);
    savePreviousValues();
    setCurrentSize({ width: '300px', height: '29px' });
    setWindowedFrameOpen(titleTranslationId, false);
  };

  const handleMaximizeToggle = () => {
    if (isMinimized) {
      setCurrentSize(prevSize);
      setCurrentPosition(prevPosition);
      setWindowedFrameMinimized(titleTranslationId, false);
      return;
    }

    if (isMaximized) {
      setCurrentSize({ width: '80%', height: '70vh' });
      setCurrentPosition({ x: 50, y: 50 });
    } else {
      savePreviousValues();
      setCurrentSize({ width: calculateMaximizedWidth(), height: '100vh' });
      setCurrentPosition({ x: 0, y: 0 });
    }

    setIsMaximized(!isMaximized);
    setWindowedFrameOpen(titleTranslationId, true);
  };

  return createPortal(
    <Rnd
      size={{ width: currentSize.width, height: currentSize.height }}
      position={{ x: currentPosition.x, y: currentPosition.y }}
      onDragStop={(_e, d) => setCurrentPosition({ x: d.x, y: d.y })}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        setCurrentSize({
          width: ref.style.width,
          height: ref.style.height,
        });
        setCurrentPosition(position);
      }}
      className={cn('overflow-hidden rounded-lg shadow-lg transition', {
        'border bg-gray-800': !isMaximized && !isMinimized,
      })}
      bounds="window"
      disableDragging={isMaximized && !isMinimized}
      enableResizing={!isMaximized}
      style={{ zIndex: 999 + openWindowedFrames.indexOf(titleTranslationId) }}
    >
      <div
        role="button"
        tabIndex={0}
        className={cn('flex items-center justify-between bg-gray-900 p-2 text-white', {
          'cursor-move p-1 hover:bg-gray-800': isMinimized,
        })}
        onClick={() => setWindowedFrameOpen(titleTranslationId, true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setWindowedFrameOpen(titleTranslationId, true);
          }
        }}
      >
        <span className="ml-2 w-[230px] overflow-hidden truncate text-ellipsis whitespace-nowrap pr-3 font-semibold">
          {t(titleTranslationId)}
        </span>
        <div className="flex space-x-2">
          {!isMinimized && !disableWindowControls && (
            <button
              type="button"
              onClick={minimizeWindow}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-sm hover:bg-gray-600"
            >
              <div className="mt-[-8px]">_</div>
            </button>
          )}
          {!disableWindowControls && (
            <button
              type="button"
              onClick={handleMaximizeToggle}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-sm hover:bg-gray-600',
                {
                  'h-5 w-5': isMinimized,
                },
              )}
            >
              <div className="mt-[-4px]">{isMaximized ? '🗗' : '🗖'}</div>
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className={cn('flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-lg hover:bg-red-500', {
              'h-5 w-5 text-sm': isMinimized,
            })}
          >
            <div>×</div>
          </button>
        </div>
      </div>
      <div className={isMinimized ? 'h-0 w-0' : 'h-[calc(100%-32px)] w-full overflow-auto scrollbar-thin'}>
        {children}
      </div>
    </Rnd>,
    document.body,
  );
};

export default ResizableWindow;
