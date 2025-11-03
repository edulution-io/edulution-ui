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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { HiOutlineChevronDoubleDown, HiOutlineChevronDoubleUp } from 'react-icons/hi';
import { IconContext } from 'react-icons';

import FloatingButtonsBarProps from '@libs/ui/types/FloatingButtons/floatingButtonsBarProps';
import FloatingButtonConfig from '@libs/ui/types/FloatingButtons/floatingButtonConfig';
import FLOATING_BUTTONS_BAR_ID from '@libs/ui/constants/floatingButtonsBarId';
import { DEBOUNCE_MS, DEFAULT_BUTTON_WIDTH, WIDTH_TOLERANCE_PX } from '@libs/ui/constants/floatingButtonsConfig';
import calculateButtonLayout from '@libs/ui/utils/calculateButtonLayout';
import cn from '@libs/common/utils/className';
import usePortalRoot from '@/hooks/usePortalRoot';
import FloatingActionButton, { FLOATING_BUTTON_CLASS_NAME } from '@/components/ui/FloatingActionButton';
import { Button } from '@/components/shared/Button';

const FloatingButtonsBar: React.FC<FloatingButtonsBarProps> = ({ config }) => {
  const { t } = useTranslation();
  const portalRoot = usePortalRoot(FLOATING_BUTTONS_BAR_ID);
  const containerRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLDivElement>(null);
  const dropupRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [buttonWidth, setButtonWidth] = useState(DEFAULT_BUTTON_WIDTH);
  const [isDropupOpen, setIsDropupOpen] = useState(false);
  const [shouldRenderDropup, setShouldRenderDropup] = useState(false);
  const [isDropupAnimatingOut, setIsDropupAnimatingOut] = useState(false);

  const { buttons, keyPrefix } = config;

  const visibleButtons = useMemo(() => buttons.filter((conf) => conf.isVisible !== false), [buttons]);

  const { hasOverflow, displayedButtons, overflowButtons } = useMemo(
    () => calculateButtonLayout(containerWidth, buttonWidth, visibleButtons),
    [containerWidth, buttonWidth, visibleButtons],
  );

  useEffect(() => {
    setIsDropupOpen(false);
    setShouldRenderDropup(false);
    setIsDropupAnimatingOut(false);
  }, [visibleButtons]);

  useEffect(() => {
    if (isDropupOpen) {
      setShouldRenderDropup(true);
      setIsDropupAnimatingOut(false);
    } else if (shouldRenderDropup) {
      setIsDropupAnimatingOut(true);
      const timer = setTimeout(() => {
        setShouldRenderDropup(false);
        setIsDropupAnimatingOut(false);
      }, 200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isDropupOpen, shouldRenderDropup]);

  useEffect(() => {
    if (!isDropupOpen) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropupRef.current &&
        moreButtonRef.current &&
        !dropupRef.current.contains(event.target as Node) &&
        !moreButtonRef.current.contains(event.target as Node)
      ) {
        setIsDropupOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropupOpen]);

  useEffect(() => {
    if (!portalRoot) return undefined;

    let debounceTimer: number | undefined;
    let lastWidth = 0;
    let lastButtonWidth = 0;

    const measureDimensions = (): { containerWidth: number; buttonWidth: number } | null => {
      if (!containerRef.current || !portalRoot) return null;

      const newContainerWidth = portalRoot.getBoundingClientRect().width;
      const firstButton = containerRef.current.querySelector<HTMLElement>('div.flex-shrink-0');
      const newButtonWidth: number = firstButton?.offsetWidth ?? lastButtonWidth;

      return { containerWidth: newContainerWidth, buttonWidth: newButtonWidth };
    };

    const updateDimensions = () => {
      const measurements = measureDimensions();
      if (!measurements) return;

      const { containerWidth: newContainerWidth, buttonWidth: newButtonWidth } = measurements;

      const widthChanged = Math.abs(newContainerWidth - lastWidth) > WIDTH_TOLERANCE_PX;
      const buttonWidthChanged = newButtonWidth !== lastButtonWidth;

      if (widthChanged || buttonWidthChanged) {
        lastWidth = newContainerWidth;
        lastButtonWidth = newButtonWidth;
        setContainerWidth(newContainerWidth);
        if (newButtonWidth > 0) {
          setButtonWidth(newButtonWidth);
        }
      }
    };

    const debouncedUpdate = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = window.setTimeout(updateDimensions, DEBOUNCE_MS);
    };

    const initialTimer = setTimeout(updateDimensions, 0);
    const resizeObserver = new ResizeObserver(debouncedUpdate);
    resizeObserver.observe(portalRoot);
    window.addEventListener('resize', debouncedUpdate);

    return () => {
      clearTimeout(initialTimer);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', debouncedUpdate);
    };
  }, [visibleButtons, portalRoot]);

  const iconContextValue = useMemo(() => ({ className: 'h-6 w-6 m-4 md:h-8 md:w-8 md:m-5' }), []);

  const renderButton = (buttonConfig: FloatingButtonConfig, key: string) => (
    <div
      key={key}
      className="flex-shrink-0 duration-200 animate-in fade-in slide-in-from-bottom-2"
    >
      <FloatingActionButton
        variant={buttonConfig.variant ?? 'button'}
        icon={buttonConfig.icon}
        text={buttonConfig.text}
        onClick={buttonConfig.onClick}
        dropdownItems={buttonConfig.dropdownItems}
      />
    </div>
  );

  const toggleDropup = () => setIsDropupOpen((prev) => !prev);

  if (!portalRoot) return null;

  const content = (
    <div
      ref={containerRef}
      className="pointer-events-auto flex min-w-0 flex-grow-0 justify-start transition-all duration-200 ease-in-out"
    >
      {displayedButtons.map((buttonConfig) => renderButton(buttonConfig, `${keyPrefix}${buttonConfig.text}`))}

      {hasOverflow && (
        <div
          ref={moreButtonRef}
          className="relative flex flex-shrink-0 flex-col items-center justify-center pr-1 duration-200 animate-in fade-in slide-in-from-bottom-2 md:pt-1"
        >
          <Button
            type="button"
            variant="btn-hexagon"
            onClick={toggleDropup}
            className="bg-opacity-90 p-1 md:p-4"
            hexagonIconAltText={isDropupOpen ? t('common.close') : t('common.showMore')}
          >
            <IconContext.Provider value={iconContextValue}>
              {isDropupOpen ? <HiOutlineChevronDoubleDown /> : <HiOutlineChevronDoubleUp />}
            </IconContext.Provider>
          </Button>
          <span className={FLOATING_BUTTON_CLASS_NAME}>{isDropupOpen ? t('common.less') : t('common.more')}</span>

          {shouldRenderDropup && (
            <div
              ref={dropupRef}
              className={cn(
                'absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 transform flex-col gap-2 rounded-xl bg-black bg-opacity-90 p-4 shadow-lg backdrop-blur',
                'z-[9999]',
                isDropupAnimatingOut
                  ? 'duration-200 animate-out fade-out slide-out-to-bottom-0'
                  : 'duration-200 animate-in fade-in slide-in-from-bottom-0',
              )}
            >
              {overflowButtons.map((buttonConfig) =>
                renderButton(buttonConfig, `${keyPrefix}overflow-${buttonConfig.text}`),
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return createPortal(content, portalRoot);
};

export default FloatingButtonsBar;
