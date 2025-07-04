/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { Position, Rnd } from 'react-rnd';
import useMedia from '@/hooks/useMedia';
import cn from '@libs/common/utils/className';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import useWindowResize from '@/hooks/useWindowResize';
import { SIDEBAR_WIDTH } from '@libs/ui/constants';
import { DEFAULT_MINIMIZED_BAR_HEIGHT, MAXIMIZED_BAR_HEIGHT } from '@libs/ui/constants/resizableWindowElements';
import MinimizeButton from '@/components/structure/framing/ResizableWindow/Buttons/MinimizeButton';
import ToggleMaximizeButton from '@/components/structure/framing/ResizableWindow/Buttons/ToggleMaximizeButton';
import CloseButton from '@/components/structure/framing/ResizableWindow/Buttons/CloseButton';
import RectangleSize from '@libs/ui/types/rectangleSize';
import { HiOutlineCursorArrowRipple } from 'react-icons/hi2';
import RESIZEABLE_WINDOW_DEFAULT_POSITION from '@libs/ui/constants/resizableWindowDefaultPosition';
import RESIZABLE_WINDOW_DEFAULT_SIZE from '@libs/ui/constants/resizableWindowDefaultSize';

interface ResizableWindowProps {
  titleTranslationId: string;
  children?: ReactNode;
  handleClose: () => void;
  disableMinimizeWindow?: boolean;
  disableToggleMaximizeWindow?: boolean;
  initialPosition?: Position;
  initialSize?: RectangleSize;
  openMaximized?: boolean;
  stickToInitialSizeAndPositionWhenRestored?: boolean;
  additionalButtons?: (ReactElement | null)[];
}

const ResizableWindow: React.FC<ResizableWindowProps> = ({
  titleTranslationId,
  children,
  handleClose,
  disableMinimizeWindow = false,
  disableToggleMaximizeWindow = false,
  openMaximized = true,
  initialPosition,
  initialSize,
  stickToInitialSizeAndPositionWhenRestored = false,
  additionalButtons = [],
}) => {
  const windowSize = useWindowResize();
  const { isMobileView } = useMedia();
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

  const [isMaximized, setIsMaximized] = useState(openMaximized);
  const [currentPosition, setCurrentPosition] = useState<Position>(initialPosition || { x: 0, y: 0 });
  const [prevPosition, setPrevPosition] = useState(currentPosition);

  const isMinimized = minimizedWindowedFrames.includes(titleTranslationId);

  const [prevSize, setPrevSize] = useState(currentWindowedFrameSizes[titleTranslationId]);

  const documentWidth = document.documentElement.clientWidth;
  const documentHeight = document.documentElement.clientHeight;

  const setMaxWidth = () => {
    const width = isMobileView ? documentWidth : documentWidth - SIDEBAR_WIDTH;
    setCurrentWindowedFrameSize(titleTranslationId, {
      width,
      height: documentHeight,
    });
  };

  useEffect(() => {
    if (initialSize) {
      setCurrentWindowedFrameSize(titleTranslationId, initialSize);
    }
  }, []);

  useEffect(() => {
    if (isMaximized && !isMinimized) {
      setMaxWidth();
      return;
    }

    if (initialPosition) {
      setCurrentPosition(initialPosition);
    }
    if (initialSize) {
      setCurrentWindowedFrameSize(titleTranslationId, initialSize);
    }
  }, [windowSize, isMaximized, isMinimized, isMobileView, titleTranslationId, initialPosition, initialSize]);

  const minimizedWidth = Math.min(300, documentWidth * 0.333);

  function adjustPositionAndSizeForMinimizedState() {
    const maxVisibleY = documentHeight - DEFAULT_MINIMIZED_BAR_HEIGHT;
    const maxVisibleX = documentWidth - minimizedWidth;

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

      setCurrentPosition({ x: calculatedPosition, y: documentHeight - DEFAULT_MINIMIZED_BAR_HEIGHT });
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
      setCurrentWindowedFrameSize(
        titleTranslationId,
        initialSize || {
          width: (currentWindowedFrameSizes[titleTranslationId]?.width || RESIZABLE_WINDOW_DEFAULT_SIZE.width) * 0.8,
          height: (currentWindowedFrameSizes[titleTranslationId]?.height || RESIZABLE_WINDOW_DEFAULT_SIZE.height) * 0.7,
        },
      );
      setCurrentPosition(initialPosition || RESIZEABLE_WINDOW_DEFAULT_POSITION);
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

  const isCurrentlySticky = stickToInitialSizeAndPositionWhenRestored && !isMinimized && !isMaximized;
  const disableDragging = (isMaximized && !isMinimized) || (isMobileView && isMinimized) || isCurrentlySticky;

  return createPortal(
    <Rnd
      dragHandleClassName="drag-handle"
      minHeight={isMinimized ? DEFAULT_MINIMIZED_BAR_HEIGHT : 300}
      minWidth={isMinimized ? minimizedWidth : undefined}
      size={{
        width: currentWindowedFrameSizes[titleTranslationId]?.width || RESIZABLE_WINDOW_DEFAULT_SIZE.width,
        height: currentWindowedFrameSizes[titleTranslationId]?.height || RESIZABLE_WINDOW_DEFAULT_SIZE.height,
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
      className={cn('bg-global overflow-hidden rounded-lg rounded-t-none shadow-lg', {
        'rounded-t-lg border border-slate-500 bg-gray-800': !isMaximized && !isMinimized && !isCurrentlySticky,
        'rounded-none transition-transform active:transition-none': isMinimized,
      })}
      bounds="window"
      disableDragging={disableDragging}
      enableResizing={!isMaximized && !isCurrentlySticky}
      style={{
        zIndex: zIndex + (isCurrentlySticky ? 30 : 500),
      }}
    >
      {!hasCurrentFramedWindowHighestZIndex && !isMinimized && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        <div
          className="group pointer-events-auto absolute left-0 top-0 flex h-full w-full items-center justify-center bg-overlay-transparent opacity-10 hover:opacity-100"
          style={{
            zIndex: zIndex + 1,
          }}
          onClick={() => setWindowedFramesZIndices(titleTranslationId)}
        >
          <div
            style={{ marginTop: MAXIMIZED_BAR_HEIGHT }}
            className="h-14 w-14 rounded-full bg-foreground p-2 opacity-0 group-hover:opacity-100"
          >
            <HiOutlineCursorArrowRipple size={40} />
          </div>
        </div>
      )}
      <div
        role="button"
        tabIndex={0}
        style={{ height: isMinimized ? DEFAULT_MINIMIZED_BAR_HEIGHT : MAXIMIZED_BAR_HEIGHT }}
        className={cn('sticky top-0 flex items-center justify-between bg-gray-900 text-background', {
          'cursor-default': disableDragging,
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
          {!isMinimized && additionalButtons}
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
