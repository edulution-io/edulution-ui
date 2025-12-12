/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Client, WebSocketTunnel, Touch, Keyboard, Status, Mouse } from '@glokon/guacamole-common-js';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import ResizableWindow from '@/components/structure/framing/ResizableWindow/ResizableWindow';
import GUACAMOLE_WEBSOCKET_URL from '@libs/desktopdeployment/constants/guacamole-websocket-url';
import getBrowserTimezone from '@libs/common/utils/Date/getBrowserTimezone';
import { guacamoleClientStateMap, getGuacamoleErrorMessage } from '@/pages/DesktopDeployment/utils';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import { MAXIMIZED_BAR_HEIGHT } from '@libs/ui/constants/resizableWindowElements';
import RESIZABLE_WINDOW_DEFAULT_SIZE from '@libs/ui/constants/resizableWindowDefaultSize';

type GuacamoleFrameProps = {
  frameId: string;
  guacToken: string;
  dataSource: string;
  connectionUri: string;
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: () => void;
  enableAudio?: boolean;
  enableTouch?: boolean;
  disableToggleMaximizeWindow?: boolean;
  openMaximized?: boolean;
};

const GuacamoleFrame: React.FC<GuacamoleFrameProps> = ({
  frameId,
  guacToken,
  dataSource,
  connectionUri,
  isOpen,
  onClose,
  onDisconnect,
  enableAudio = false,
  enableTouch = false,
  disableToggleMaximizeWindow = false,
  openMaximized = true,
}) => {
  const displayRef = useRef<HTMLDivElement>(null);
  const guacRef = useRef<Client | null>(null);
  const [clientState, setClientState] = useState<Client.State>(Client.State.IDLE);
  const [hasFrameSizeLoaded, setHasFrameSizeLoaded] = useState(false);
  const { currentWindowedFrameSizes, minimizedWindowedFrames } = useFrameStore();

  const width = currentWindowedFrameSizes[frameId]?.width || RESIZABLE_WINDOW_DEFAULT_SIZE.width;
  const height = (currentWindowedFrameSizes[frameId]?.height || MAXIMIZED_BAR_HEIGHT) - MAXIMIZED_BAR_HEIGHT;
  const isMinimized = minimizedWindowedFrames.includes(frameId);

  useEffect(() => {
    if (!hasFrameSizeLoaded && width > 0 && height > 0) {
      setHasFrameSizeLoaded(true);
    }
  }, [width, height, hasFrameSizeLoaded]);

  const handleDisconnect = useCallback(() => {
    try {
      if (guacRef.current) {
        guacRef.current.disconnect();
      }
    } catch (e) {
      console.error('Guacamole disconnect error:', e);
    } finally {
      guacRef.current = null;
      setClientState(Client.State.IDLE);
      onDisconnect();
    }
  }, [onDisconnect]);

  useEffect(() => {
    if (displayRef.current && isOpen && !isMinimized) {
      displayRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (guacToken === '' || !displayRef.current || !isOpen || !hasFrameSizeLoaded) {
      return undefined;
    }

    if (guacRef.current) {
      return undefined;
    }

    const displayElement = displayRef.current;
    displayElement.tabIndex = 0;
    let isCleanedUp = false;

    const tunnel = new WebSocketTunnel(GUACAMOLE_WEBSOCKET_URL);
    const guac = new Client(tunnel);
    guacRef.current = guac;

    tunnel.onerror = (status: Status) => {
      if (isCleanedUp) return;
      const errorMessage = getGuacamoleErrorMessage(status);
      console.error('Guacamole tunnel error:', status.code, errorMessage);
    };

    guac.onstatechange = (state: Client.State) => {
      if (isCleanedUp) return;
      console.info(`Guacamole state: ${guacamoleClientStateMap[state]}`);
      setClientState(state);

      if (state === Client.State.DISCONNECTED) {
        handleDisconnect();
      }
    };

    guac.onerror = (status: Status) => {
      if (isCleanedUp) return;
      const errorMessage = getGuacamoleErrorMessage(status);
      console.error('Guacamole error:', status.code, errorMessage);
    };

    const guacDisplay = guac.getDisplay();
    const guacDisplayElement = guacDisplay.getElement();

    const styleDisplayElements = () => {
      const canvases = displayElement.querySelectorAll('canvas');
      canvases.forEach((canvas) => {
        const el = canvas;
        el.style.position = 'absolute';
        el.style.zIndex = '1';
      });
    };

    styleDisplayElements();
    const mutationObserver = new MutationObserver(styleDisplayElements);
    mutationObserver.observe(displayElement, { childList: true, subtree: true });

    displayElement.appendChild(guacDisplayElement);

    const mouseState = {
      x: 0,
      y: 0,
      left: false,
      middle: false,
      right: false,
      up: false,
      down: false,
    };

    const getRelativeCoordinates = (event: MouseEvent) => {
      const rect = displayElement.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const updateMouseState = (event: MouseEvent) => {
      const coords = getRelativeCoordinates(event);
      mouseState.x = coords.x;
      mouseState.y = coords.y;
    };

    const handleMouseMove = (event: MouseEvent) => {
      updateMouseState(event);
      guac.sendMouseState(mouseState as Mouse.State);
    };

    const handleMouseDown = (event: MouseEvent) => {
      updateMouseState(event);
      switch (event.button) {
        case 0:
          mouseState.left = true;
          break;
        case 1:
          mouseState.middle = true;
          break;
        case 2:
          mouseState.right = true;
          break;
        default:
          break;
      }
      guac.sendMouseState(mouseState as Mouse.State);
    };

    const handleMouseUp = (event: MouseEvent) => {
      updateMouseState(event);
      switch (event.button) {
        case 0:
          mouseState.left = false;
          break;
        case 1:
          mouseState.middle = false;
          break;
        case 2:
          mouseState.right = false;
          break;
        default:
          break;
      }
      guac.sendMouseState(mouseState as Mouse.State);
    };

    const handleWheel = (event: WheelEvent) => {
      updateMouseState(event);
      if (event.deltaY < 0) {
        mouseState.up = true;
        guac.sendMouseState(mouseState as Mouse.State);
        mouseState.up = false;
        guac.sendMouseState(mouseState as Mouse.State);
      } else if (event.deltaY > 0) {
        mouseState.down = true;
        guac.sendMouseState(mouseState as Mouse.State);
        mouseState.down = false;
        guac.sendMouseState(mouseState as Mouse.State);
      }
    };

    const handleContextMenu = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    displayElement.addEventListener('mousemove', handleMouseMove);
    displayElement.addEventListener('mousedown', handleMouseDown);
    displayElement.addEventListener('mouseup', handleMouseUp);
    displayElement.addEventListener('wheel', handleWheel);
    displayElement.addEventListener('contextmenu', handleContextMenu);

    let touch: Touch | null = null;
    if (enableTouch) {
      touch = new Touch(displayElement);
      touch.ontouchstart = guac.sendTouchState.bind(guac);
      touch.ontouchend = guac.sendTouchState.bind(guac);
      touch.ontouchmove = guac.sendTouchState.bind(guac);
    }

    const keyboard = new Keyboard(displayElement);
    keyboard.onkeydown = (keysym: number) => {
      guac.sendKeyEvent(1, keysym);
      return false;
    };
    keyboard.onkeyup = (keysym: number) => {
      guac.sendKeyEvent(0, keysym);
      return false;
    };

    const params = new URLSearchParams();
    params.set('token', guacToken);
    params.set('GUAC_ID', connectionUri);
    params.set('GUAC_TYPE', 'c');
    params.set('GUAC_DATA_SOURCE', dataSource);
    params.set('GUAC_WIDTH', String(width));
    params.set('GUAC_HEIGHT', String(height));
    params.set('GUAC_DPI', '96');
    params.set('GUAC_TIMEZONE', getBrowserTimezone());

    if (enableAudio) {
      params.append('GUAC_AUDIO', 'audio/L16');
      params.append('GUAC_IMAGE', 'image/jpeg');
      params.append('GUAC_IMAGE', 'image/png');
      params.append('GUAC_IMAGE', 'image/webp');
    }

    try {
      guac.connect(params.toString());
    } catch (e) {
      console.error('Guacamole connect error:', e);
    }

    return () => {
      isCleanedUp = true;
      mutationObserver.disconnect();
      displayElement.removeEventListener('mousemove', handleMouseMove);
      displayElement.removeEventListener('mousedown', handleMouseDown);
      displayElement.removeEventListener('mouseup', handleMouseUp);
      displayElement.removeEventListener('wheel', handleWheel);
      displayElement.removeEventListener('contextmenu', handleContextMenu);
      if (touch) {
        touch.ontouchstart = undefined;
        touch.ontouchend = undefined;
        touch.ontouchmove = undefined;
      }
      keyboard.onkeydown = null;
      keyboard.onkeyup = null;
      guac.disconnect();
      guacRef.current = null;
    };
  }, [guacToken, connectionUri, dataSource, isOpen, enableAudio, enableTouch, handleDisconnect, hasFrameSizeLoaded]);

  useEffect(() => {
    if (clientState === Client.State.CONNECTED && !isMinimized && guacRef.current) {
      guacRef.current.sendSize(width, height);
      if (displayRef.current) {
        displayRef.current.focus();
      }
    }
  }, [clientState, width, height, isMinimized]);

  if (!isOpen) {
    return null;
  }

  return (
    <ResizableWindow
      titleTranslationId={frameId}
      handleClose={onClose}
      disableToggleMaximizeWindow={disableToggleMaximizeWindow}
      openMaximized={openMaximized}
    >
      <div
        id={`guac-display-${frameId}`}
        ref={displayRef}
        className="relative h-full w-full border-none bg-black outline-none"
      />
      {clientState < Client.State.CONNECTED && <LoadingIndicatorDialog isOpen />}
    </ResizableWindow>
  );
};

export default GuacamoleFrame;
