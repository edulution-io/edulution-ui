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

const VideoComponent: React.FC<VideoComponentProps> = ({
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
  <div
    className="video-player"
    style={{ position: 'relative', paddingTop: '56.25%', ...style }}
  >
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

export default VideoComponent;
