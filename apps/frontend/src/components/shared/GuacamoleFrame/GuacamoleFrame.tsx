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
import { Client, WebSocketTunnel, Mouse, Touch, Keyboard, Status } from '@glokon/guacamole-common-js';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import ResizableWindow from '@/components/structure/framing/ResizableWindow/ResizableWindow';
import GUACAMOLE_WEBSOCKET_URL from '@libs/desktopdeployment/constants/guacamole-websocket-url';
import getBrowserTimezone from '@libs/common/utils/Date/getBrowserTimezone';
import { guacamoleClientStateMap, getGuacamoleErrorMessage } from '@/pages/DesktopDeployment/utils';

type GuacamoleFrameProps = {
  frameId: string;
  guacToken: string;
  dataSource: string;
  connectionUri: string;
  isOpen: boolean;
  width: number;
  height: number;
  isMinimized: boolean;
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
  width,
  height,
  isMinimized,
  onClose,
  onDisconnect,
  enableAudio = false,
  enableTouch = false,
  disableToggleMaximizeWindow = false,
  openMaximized = true,
}) => {
  const displayRef = useRef<HTMLDivElement>(null);
  const guacRef = useRef<Client | null>(null);
  const widthRef = useRef(width);
  const heightRef = useRef(height);
  const [clientState, setClientState] = useState<Client.State>(Client.State.IDLE);

  widthRef.current = width;
  heightRef.current = height;

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
    if (guacToken === '' || !displayRef.current || !isOpen || widthRef.current <= 0 || heightRef.current <= 0) {
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

    const sendMouseState = guac.sendMouseState.bind(guac);
    const mouse = new Mouse(displayElement);
    mouse.onmousedown = sendMouseState;
    mouse.onmouseup = sendMouseState;
    mouse.onmousemove = sendMouseState;

    let touchscreen: Mouse.Touchscreen | null = null;
    let touch: Touch | null = null;
    if (enableTouch) {
      touchscreen = new Mouse.Touchscreen(displayElement);
      touchscreen.onmousedown = sendMouseState;
      touchscreen.onmouseup = sendMouseState;
      touchscreen.onmousemove = sendMouseState;

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
    params.set('GUAC_WIDTH', String(widthRef.current));
    params.set('GUAC_HEIGHT', String(heightRef.current));
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
      mouse.onmousedown = undefined;
      mouse.onmouseup = undefined;
      mouse.onmousemove = undefined;
      if (touchscreen) {
        touchscreen.onmousedown = undefined;
        touchscreen.onmouseup = undefined;
        touchscreen.onmousemove = undefined;
      }
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
  }, [guacToken, connectionUri, dataSource, isOpen, enableAudio, enableTouch, handleDisconnect]);

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
        className="h-full w-full border-none bg-black outline-none"
      />
      {clientState < Client.State.CONNECTED && <LoadingIndicatorDialog isOpen />}
    </ResizableWindow>
  );
};

export default GuacamoleFrame;
