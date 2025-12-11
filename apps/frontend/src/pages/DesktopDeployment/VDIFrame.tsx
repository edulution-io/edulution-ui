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

import React, { useCallback, useEffect, useState } from 'react';
import GuacamoleFrame from '@/components/shared/GuacamoleFrame/GuacamoleFrame';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import { MAXIMIZED_BAR_HEIGHT } from '@libs/ui/constants/resizableWindowElements';
import RESIZABLE_WINDOW_DEFAULT_SIZE from '@libs/ui/constants/resizableWindowDefaultSize';
import useDesktopDeploymentStore from './useDesktopDeploymentStore';

const VDI_FRAME_ID = 'desktopdeployment.topic';

const VDIFrame = () => {
  const { error, guacToken, dataSource, connectionUri, isVdiConnectionOpen, setIsVdiConnectionOpen } =
    useDesktopDeploymentStore();
  const { currentWindowedFrameSizes, minimizedWindowedFrames } = useFrameStore();
  const [hasCurrentFrameSizeLoaded, setHasCurrentFrameSizeLoaded] = useState(false);

  const width = currentWindowedFrameSizes[VDI_FRAME_ID]?.width || RESIZABLE_WINDOW_DEFAULT_SIZE.width;
  const height =
    (currentWindowedFrameSizes[VDI_FRAME_ID]?.height || RESIZABLE_WINDOW_DEFAULT_SIZE.height) - MAXIMIZED_BAR_HEIGHT;
  const isMinimized = minimizedWindowedFrames.includes(VDI_FRAME_ID);

  useEffect(() => {
    if (!hasCurrentFrameSizeLoaded && width > 0 && height > 0) {
      setHasCurrentFrameSizeLoaded(true);
    }
  }, [hasCurrentFrameSizeLoaded, width, height]);

  const handleClose = useCallback(() => {
    setIsVdiConnectionOpen(false);
  }, [setIsVdiConnectionOpen]);

  const handleDisconnect = useCallback(() => {
    setIsVdiConnectionOpen(false);
    setHasCurrentFrameSizeLoaded(false);
  }, [setIsVdiConnectionOpen]);

  if (!isVdiConnectionOpen || error || !hasCurrentFrameSizeLoaded) {
    return null;
  }

  return (
    <GuacamoleFrame
      frameId={VDI_FRAME_ID}
      guacToken={guacToken}
      dataSource={dataSource}
      connectionUri={connectionUri}
      isOpen={isVdiConnectionOpen}
      width={width}
      height={height}
      isMinimized={isMinimized}
      onClose={handleClose}
      onDisconnect={handleDisconnect}
      enableAudio
      enableTouch
      disableToggleMaximizeWindow
    />
  );
};

export default VDIFrame;
