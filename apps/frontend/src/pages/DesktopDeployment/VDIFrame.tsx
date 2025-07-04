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

import React, { useEffect, useRef, useState } from 'react';
import Guacamole from 'guacamole-common-js';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import { MAXIMIZED_BAR_HEIGHT } from '@libs/ui/constants/resizableWindowElements';
import RESIZABLE_WINDOW_DEFAULT_SIZE from '@libs/ui/constants/resizableWindowDefaultSize';
import ResizableWindow from '@/components/structure/framing/ResizableWindow/ResizableWindow';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import GUACAMOLE_WEBSOCKET_URL from '@libs/desktopdeployment/constants/guacamole-websocket-url';
import useDesktopDeploymentStore from './useDesktopDeploymentStore';

const VDIFrame = () => {
  const displayRef = useRef<HTMLDivElement>(null);
  const guacRef = useRef<Guacamole.Client | null>(null);
  const { error, guacToken, dataSource, guacId, isVdiConnectionOpen, setIsVdiConnectionOpen } =
    useDesktopDeploymentStore();
  const [clientState, setClientState] = useState(0);
  const [hasCurrentFrameSizeLoaded, setHasCurrentFrameSizeLoaded] = useState(false);
  const { currentWindowedFrameSizes, minimizedWindowedFrames } = useFrameStore();

  const handleDisconnect = () => {
    if (guacRef.current) {
      guacRef.current.disconnect();
    }
    setIsVdiConnectionOpen(false);
    setClientState(0);
    setHasCurrentFrameSizeLoaded(false);
  };

  const id = 'desktopdeployment.topic';
  const width = currentWindowedFrameSizes[id]?.width || RESIZABLE_WINDOW_DEFAULT_SIZE.width;
  const height = (currentWindowedFrameSizes[id]?.height || MAXIMIZED_BAR_HEIGHT) - MAXIMIZED_BAR_HEIGHT;
  const isMinimized = minimizedWindowedFrames.includes(id);

  useEffect(() => {
    if (!hasCurrentFrameSizeLoaded) {
      setHasCurrentFrameSizeLoaded(!!width && !!height);
    }
  }, [currentWindowedFrameSizes[id]]);

  useEffect(() => {
    if (displayRef.current) {
      if (isVdiConnectionOpen && !isMinimized) {
        displayRef.current.focus();
      }
    }
  }, [displayRef.current, isVdiConnectionOpen, isMinimized]);

  useEffect(() => {
    if (guacToken === '' || !displayRef.current || !isVdiConnectionOpen || !hasCurrentFrameSizeLoaded) return () => {};

    const tunnel = new Guacamole.WebSocketTunnel(GUACAMOLE_WEBSOCKET_URL);
    const guac = new Guacamole.Client(tunnel);
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
      GUAC_TIMEZONE: 'Europe/Berlin',
      GUAC_AUDIO: ['audio/L8', 'audio/L16'],
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
    guac.connect(params);

    const guacSendMouseState = guac.sendMouseState.bind(guac);

    const mouse = new Guacamole.Mouse(displayElement);
    mouse.onmousedown = guacSendMouseState;
    mouse.onmouseup = guacSendMouseState;
    mouse.onmousemove = guacSendMouseState;

    const touchscreen = new Guacamole.Mouse.Touchscreen(displayElement);
    touchscreen.onmousedown = guacSendMouseState;
    touchscreen.onmouseup = guacSendMouseState;
    touchscreen.onmousemove = guacSendMouseState;

    const touch = new Guacamole.Touch(displayElement);
    touch.ontouchstart = guac.sendTouchState.bind(guac);
    touch.ontouchend = guac.sendTouchState.bind(guac);
    touch.ontouchmove = guac.sendTouchState.bind(guac);

    const keyboard = new Guacamole.Keyboard(displayElement);
    keyboard.onkeydown = (keysym) => guac.sendKeyEvent(1, keysym);
    keyboard.onkeyup = (keysym) => guac.sendKeyEvent(0, keysym);

    displayElement.appendChild(guac.getDisplay().getElement());

    const canvasElements = Array.from(displayElement.getElementsByTagName('canvas'));
    canvasElements.forEach((canvas) => {
      const newCanvas = canvas;
      newCanvas.style.position = 'absolute';
      newCanvas.style.zIndex = '1';
    });

    guac.onstatechange = (state) => {
      const stateMap = {
        0: 'IDLE',
        1: 'CONNECTING',
        2: 'WAITING',
        3: 'CONNECTED',
        4: 'DISCONNECTING',
        5: 'DISCONNECTED',
      };
      console.info(`Guacamole changed the state to ${stateMap[state]}`);
      setClientState(state);

      if (state === 5) {
        handleDisconnect();
      }
    };

    return () => {
      handleDisconnect();
    };
  }, [guacToken, isVdiConnectionOpen, hasCurrentFrameSizeLoaded]);

  useEffect(() => {
    if (guacRef.current && !isMinimized && displayRef.current) {
      guacRef.current.sendSize(width, height);
      displayRef.current.focus();
    }
  }, [guacRef.current, width, height, isMinimized]);

  if (!isVdiConnectionOpen || error) {
    return null;
  }

  return (
    <ResizableWindow
      titleTranslationId={id}
      handleClose={handleDisconnect}
      disableToggleMaximizeWindow
    >
      <div
        id="display"
        ref={displayRef}
        className="h-full w-full border-none bg-black"
      />
      {clientState < 3 && <LoadingIndicatorDialog isOpen />}
    </ResizableWindow>
  );
};

export default VDIFrame;
