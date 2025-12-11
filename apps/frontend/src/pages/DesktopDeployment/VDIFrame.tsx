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
import { Client, WebSocketTunnel, Mouse, Touch, Keyboard } from '@glokon/guacamole-common-js';
import { useDebounceCallback } from 'usehooks-ts';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import { MAXIMIZED_BAR_HEIGHT } from '@libs/ui/constants/resizableWindowElements';
import RESIZABLE_WINDOW_DEFAULT_SIZE from '@libs/ui/constants/resizableWindowDefaultSize';
import ResizableWindow from '@/components/structure/framing/ResizableWindow/ResizableWindow';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import GUACAMOLE_WEBSOCKET_URL from '@libs/desktopdeployment/constants/guacamole-websocket-url';
import getBrowserTimezone from '@libs/common/utils/Date/getBrowserTimezone';
import { guacamoleClientStateMap, getGuacamoleErrorMessage } from './utils';
import useDesktopDeploymentStore from './useDesktopDeploymentStore';

const VDIFrame = () => {
  const displayRef = useRef<HTMLDivElement>(null);
  const guacRef = useRef<Client | null>(null);
  const { error, guacToken, dataSource, guacId, isVdiConnectionOpen, setIsVdiConnectionOpen } =
    useDesktopDeploymentStore();
  const [clientState, setClientState] = useState<Client.State>(Client.State.IDLE);
  const [hasCurrentFrameSizeLoaded, setHasCurrentFrameSizeLoaded] = useState(false);
  const { currentWindowedFrameSizes, minimizedWindowedFrames } = useFrameStore();

  const handleDisconnect = useCallback(() => {
    try {
      if (guacRef.current) {
        guacRef.current.disconnect();
      }
    } catch (e) {
      console.error('Guacamole disconnect error:', e);
    } finally {
      guacRef.current = null;
      setIsVdiConnectionOpen(false);
      setClientState(Client.State.IDLE);
      setHasCurrentFrameSizeLoaded(false);
    }
  }, [setIsVdiConnectionOpen]);

  const id = 'desktopdeployment.topic';
  const width = currentWindowedFrameSizes[id]?.width || RESIZABLE_WINDOW_DEFAULT_SIZE.width;
  const height = (currentWindowedFrameSizes[id]?.height || MAXIMIZED_BAR_HEIGHT) - MAXIMIZED_BAR_HEIGHT;
  const isMinimized = minimizedWindowedFrames.includes(id);

  useEffect(() => {
    if (!hasCurrentFrameSizeLoaded) {
      setHasCurrentFrameSizeLoaded(!!width && !!height);
    }
  }, [hasCurrentFrameSizeLoaded, width, height]);

  useEffect(() => {
    if (displayRef.current && isVdiConnectionOpen && !isMinimized) {
      displayRef.current.focus();
    }
  }, [isVdiConnectionOpen, isMinimized]);

  useEffect(() => {
    if (guacToken === '' || !displayRef.current || !isVdiConnectionOpen || !hasCurrentFrameSizeLoaded) return () => {};

    const tunnel = new WebSocketTunnel(GUACAMOLE_WEBSOCKET_URL);
    const guac = new Client(tunnel);
    guacRef.current = guac;
    const displayElement = displayRef.current;
    displayElement.tabIndex = 0;

    const guacamoleConfig = {
      token: guacToken,
      GUAC_ID: guacId,
      GUAC_TYPE: 'c',
      GUAC_DATA_SOURCE: dataSource,
      GUAC_WIDTH: width,
      GUAC_HEIGHT: height,
      GUAC_DPI: 96,
      GUAC_TIMEZONE: getBrowserTimezone(),
      GUAC_AUDIO: ['audio/L16'],
      GUAC_IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
    };

    const params = new URLSearchParams();

    Object.entries(guacamoleConfig).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => params.append(key, val));
      } else {
        params.append(key, value as string);
      }
    });
    try {
      guac.connect(params);
    } catch (e) {
      console.error('Guacamole connect error', e);
    }

    const guacSendMouseState = guac.sendMouseState.bind(guac);

    const mouse = new Mouse(displayElement);
    mouse.onmousedown = guacSendMouseState;
    mouse.onmouseup = guacSendMouseState;
    mouse.onmousemove = guacSendMouseState;

    const touchscreen = new Mouse.Touchscreen(displayElement);
    touchscreen.onmousedown = guacSendMouseState;
    touchscreen.onmouseup = guacSendMouseState;
    touchscreen.onmousemove = guacSendMouseState;

    const touch = new Touch(displayElement);
    touch.ontouchstart = guac.sendTouchState.bind(guac);
    touch.ontouchend = guac.sendTouchState.bind(guac);
    touch.ontouchmove = guac.sendTouchState.bind(guac);

    const keyboard = new Keyboard(displayElement);
    keyboard.onkeydown = (keysym) => guac.sendKeyEvent(1, keysym);
    keyboard.onkeyup = (keysym) => guac.sendKeyEvent(0, keysym);

    displayElement.appendChild(guac.getDisplay().getElement());

    const styleCanvasElements = () => {
      const canvasElements = Array.from(displayElement.getElementsByTagName('canvas'));
      canvasElements.forEach((canvas) => {
        const canvasElement = canvas;
        canvasElement.style.position = 'absolute';
        canvasElement.style.zIndex = '1';
      });
    };

    styleCanvasElements();

    const mutationObserver = new MutationObserver(styleCanvasElements);
    mutationObserver.observe(displayElement, { childList: true, subtree: true });

    guac.onstatechange = (state) => {
      console.info(`Guacamole changed the state to ${guacamoleClientStateMap[state]}`);
      setClientState(state);

      if (state === Client.State.DISCONNECTED) {
        handleDisconnect();
      }
    };

    guac.onerror = (status) => {
      const errorMessage = getGuacamoleErrorMessage(status);
      console.error('Guacamole error:', status.code, errorMessage);
    };

    tunnel.onerror = (status) => {
      const errorMessage = getGuacamoleErrorMessage(status);
      console.error('WebSocket tunnel error:', status.code, errorMessage);
    };

    return () => {
      mutationObserver.disconnect();
      handleDisconnect();
    };
  }, [guacToken, isVdiConnectionOpen, hasCurrentFrameSizeLoaded, handleDisconnect]);

  const debouncedSendSize = useDebounceCallback((w: number, h: number) => {
    if (guacRef.current) {
      guacRef.current.sendSize(w, h);
    }
  }, 150);

  useEffect(() => {
    if (clientState === Client.State.CONNECTED && !isMinimized) {
      debouncedSendSize(width, height);
      if (displayRef.current) {
        displayRef.current.focus();
      }
    }
  }, [clientState, width, height, isMinimized, debouncedSendSize]);

  if (!isVdiConnectionOpen || error) {
    return null;
  }

  return (
    <ResizableWindow
      titleTranslationId={id}
      handleClose={() => setIsVdiConnectionOpen(false)}
      disableToggleMaximizeWindow
    >
      <div
        id="display"
        ref={displayRef}
        className="h-full w-full border-none bg-black"
      />
      {clientState < Client.State.CONNECTED && <LoadingIndicatorDialog isOpen />}
    </ResizableWindow>
  );
};

export default VDIFrame;
