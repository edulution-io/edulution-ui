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
  <div style={{ position: 'relative', paddingTop: '56.25%', ...style }}>
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
