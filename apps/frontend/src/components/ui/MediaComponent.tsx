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

import React from 'react';
import ReactPlayer from 'react-player';

interface VideoComponentProps {
  url: string;
  playing?: boolean;
  loop?: boolean;
  controls?: boolean;
  light?: boolean | string;
  volume?: number;
  muted?: boolean;
  playbackRate?: number;
  width?: string;
  height?: string;
  style?: React.CSSProperties;
}

const MediaComponent: React.FC<VideoComponentProps> = ({
  url,
  playing = true,
  loop = false,
  controls = true,
  light = false,
  volume = 0.8,
  muted = false,
  playbackRate = 1.0,
  width = '100%',
  height = '100%',
  style = {},
}) => (
  <div style={{ position: 'relative', width, height, ...style }}>
    <ReactPlayer
      url={url}
      playing={playing}
      loop={loop}
      controls={controls}
      light={light}
      volume={volume}
      muted={muted}
      playbackRate={playbackRate}
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
    />
  </div>
);

export default MediaComponent;
