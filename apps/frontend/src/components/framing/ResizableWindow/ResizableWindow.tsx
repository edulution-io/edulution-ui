import React, { ReactNode, useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import useIsMobileView from '@/hooks/useIsMobileView';
import cn from '@libs/common/utils/className';
import useFrameStore from '@/components/framing/FrameStore';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import useWindowResize from '@/hooks/useWindowResize';
import { SIDEBAR_WIDTH } from '@libs/ui/constants';
import { DEFAULT_MINIMIZED_BAR_HEIGHT, MAXIMIZED_BAR_HEIGHT } from '@libs/ui/constants/resizableWindowElements';
import MinimizeButton from '@/components/framing/ResizableWindow/MinimizedButton';
import ToggleMaximizeButton from '@/components/framing/ResizableWindow/ToggleMaximizeButton';
import CloseButton from '@/components/framing/ResizableWindow/CloseButton';

interface ResizableWindowProps {
  titleTranslationId: string;
  children?: ReactNode;
  handleClose: () => void;
  disableMinimizeWindow?: boolean;
  disableToggleMaximizeWindow?: boolean;
}

const ResizableWindow: React.FC<ResizableWindowProps> = ({
  titleTranslationId,
  children,
  handleClose,
  disableMinimizeWindow = false,
  disableToggleMaximizeWindow = false,
}) => {
  const windowSize = useWindowResize();
  const isMobileView = useIsMobileView();
  const { t } = useTranslation();
  const {
    minimizedWindowedFrames,
    setWindowedFrameMinimized,
    setWindowedFrameOpen,
    currentWindowedFrameSizes,
    setCurrentWindowedFrameSize,
    windowedFramesZIndices,
    setWindowedFramesZIndices,
    hasFramedWindowHighestZIndex,
  } = useFrameStore();

  const [isMaximized, setIsMaximized] = useState(true);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [prevPosition, setPrevPosition] = useState(currentPosition);

  const isMinimized = minimizedWindowedFrames.includes(titleTranslationId);

  const [prevSize, setPrevSize] = useState(currentWindowedFrameSizes[titleTranslationId]);

  const setMaxWidth = () => {
    const width = isMobileView ? window.innerWidth : window.innerWidth - SIDEBAR_WIDTH;
    setCurrentWindowedFrameSize(titleTranslationId, {
      width,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    if (isMaximized && !isMinimized) {
      setMaxWidth();
    }
  }, [windowSize, isMaximized, isMinimized, isMobileView]);

  const minimizedWidth = Math.min(300, window.innerWidth * 0.333);

  function adjustPositionAndSizeForMinimizedState() {
    const maxVisibleY = window.innerHeight - DEFAULT_MINIMIZED_BAR_HEIGHT;
    const maxVisibleX = window.innerWidth - minimizedWidth;

    const adjustedX = Math.min(currentPosition.x, maxVisibleX);
    const adjustedY = Math.min(currentPosition.y, maxVisibleY);

    setCurrentWindowedFrameSize(titleTranslationId, { width: minimizedWidth, height: DEFAULT_MINIMIZED_BAR_HEIGHT });
    setCurrentPosition({ x: adjustedX, y: adjustedY });
  }

  useEffect(() => {
    if (isMinimized) {
      adjustPositionAndSizeForMinimizedState();
    }
  }, [isMinimized, windowSize, currentPosition.x, currentPosition.y]);

  useEffect(() => {
    if (isMinimized) {
      const minimizedPositionIndex = minimizedWindowedFrames.indexOf(titleTranslationId);
      const calculatedPosition = minimizedPositionIndex * 300;

      setCurrentPosition({ x: calculatedPosition, y: window.innerHeight - DEFAULT_MINIMIZED_BAR_HEIGHT });
    }
  }, [minimizedWindowedFrames, isMinimized, titleTranslationId]);

  const savePreviousValues = () => {
    setPrevSize(currentWindowedFrameSizes[titleTranslationId]);
    setPrevPosition(currentPosition);
  };

  const minimizeWindow = () => {
    setWindowedFrameMinimized(titleTranslationId, true);
    savePreviousValues();
    setCurrentWindowedFrameSize(titleTranslationId, { width: minimizedWidth, height: DEFAULT_MINIMIZED_BAR_HEIGHT });
    setWindowedFrameOpen(titleTranslationId, false);
  };

  const handleMaximizeToggle = () => {
    if (isMinimized) {
      setCurrentWindowedFrameSize(titleTranslationId, prevSize);
      setCurrentPosition(prevPosition);
      setWindowedFrameMinimized(titleTranslationId, false);
      setWindowedFramesZIndices(titleTranslationId);
      return;
    }

    if (isMaximized) {
      setCurrentWindowedFrameSize(titleTranslationId, {
        width: currentWindowedFrameSizes[titleTranslationId].width * 0.8,
        height: currentWindowedFrameSizes[titleTranslationId].height * 0.7,
      });
      setCurrentPosition({ x: 50, y: 50 });
    } else {
      savePreviousValues();
      setMaxWidth();
      setCurrentPosition({ x: 0, y: 0 });
    }

    setIsMaximized(!isMaximized);
    setWindowedFrameOpen(titleTranslationId, true);
  };

  useEffect(() => {
    setWindowedFramesZIndices(titleTranslationId);
  }, []);

  const zIndex = windowedFramesZIndices[titleTranslationId] || 0;
  const hasCurrentFramedWindowHighestZIndex = hasFramedWindowHighestZIndex(titleTranslationId);

  return createPortal(
    <Rnd
      dragHandleClassName="drag-handle"
      minHeight={isMinimized ? DEFAULT_MINIMIZED_BAR_HEIGHT : 300}
      minWidth={isMinimized ? minimizedWidth : undefined}
      size={{
        width: currentWindowedFrameSizes[titleTranslationId]?.width || 800,
        height: currentWindowedFrameSizes[titleTranslationId]?.height || 600,
      }}
      position={{ x: currentPosition.x, y: currentPosition.y }}
      onDragStop={(_e, d) => setCurrentPosition({ x: d.x, y: d.y })}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        setCurrentWindowedFrameSize(titleTranslationId, {
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
        });
        setCurrentPosition(position);
      }}
      className={cn('overflow-hidden rounded-lg rounded-t-none shadow-lg', {
        'rounded-t-lg border border-slate-500 bg-gray-800': !isMaximized && !isMinimized,
        'rounded-none transition-transform active:transition-none': isMinimized,
      })}
      bounds="window"
      disableDragging={(isMaximized && !isMinimized) || (isMobileView && isMinimized)}
      enableResizing={!isMaximized}
      style={{
        zIndex: zIndex + 500,
      }}
    >
      {!hasCurrentFramedWindowHighestZIndex && !isMinimized && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        <div
          className="pointer-events-auto absolute left-0 top-0 h-full w-full"
          style={{
            zIndex: zIndex + 1,
          }}
          onClick={() => setWindowedFramesZIndices(titleTranslationId)}
        />
      )}
      <div
        role="button"
        tabIndex={0}
        style={{ height: isMinimized ? DEFAULT_MINIMIZED_BAR_HEIGHT : MAXIMIZED_BAR_HEIGHT }}
        className={cn('sticky top-0 flex items-center justify-between bg-gray-900 text-white', {
          'cursor-default': isMinimized,
          'cursor-move hover:bg-gray-800': isMinimized && !isMobileView,
        })}
      >
        <div className="drag-handle h-full w-[calc(100%-40px)] overflow-hidden truncate text-ellipsis">
          <div
            style={{ lineHeight: `${isMinimized ? DEFAULT_MINIMIZED_BAR_HEIGHT : MAXIMIZED_BAR_HEIGHT}px` }}
            className={cn('ml-2 whitespace-nowrap px-3 text-base font-semibold', { 'ml-0': isMinimized })}
          >
            {t(titleTranslationId)}
          </div>
        </div>
        <div className="flex">
          {!isMinimized && !disableMinimizeWindow && <MinimizeButton minimizeWindow={minimizeWindow} />}
          {((isMinimized && !disableMinimizeWindow && disableToggleMaximizeWindow) || !disableToggleMaximizeWindow) && (
            <ToggleMaximizeButton
              handleMaximizeToggle={handleMaximizeToggle}
              isMaximized={isMaximized}
              isMinimized={isMinimized}
            />
          )}
          <CloseButton
            handleClose={() => {
              handleClose();
              setWindowedFrameMinimized(titleTranslationId, false);
              setWindowedFrameOpen(titleTranslationId, false);
            }}
            className={isMinimized ? 'h-7 w-7 px-1' : ''}
          />
        </div>
      </div>
      <div
        style={{ height: isMinimized ? 0 : `calc(100% - ${MAXIMIZED_BAR_HEIGHT}px)` }} // here i want the equivalent of h-[calc(100%-40px)]
        className={isMinimized ? 'hidden w-0' : 'w-full overflow-hidden'}
      >
        {children}
      </div>
    </Rnd>,
    document.body,
  );
};

export default ResizableWindow;
