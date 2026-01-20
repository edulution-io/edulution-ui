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

import React, { useEffect, useRef } from 'react';

interface MediaComponentProps {
  url: string;
  isVideo?: boolean;
  playing?: boolean;
  loop?: boolean;
  controls?: boolean;
  volume?: number;
  muted?: boolean;
  playbackRate?: number;
  width?: string;
  height?: string;
  style?: React.CSSProperties;
}

const MediaComponent: React.FC<MediaComponentProps> = ({
  url,
  isVideo = true,
  playing = true,
  loop = false,
  controls = true,
  volume = 0.8,
  muted = false,
  playbackRate = 1.0,
  width = '100%',
  height = '100%',
  style = {},
}) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    media.volume = volume;
    media.playbackRate = playbackRate;

    if (playing) {
      media.play().catch(() => {});
    } else {
      media.pause();
    }
  }, [playing, volume, playbackRate]);

  const commonProps = {
    src: url,
    loop,
    controls,
    muted,
    autoPlay: playing,
  };

  if (isVideo) {
    return (
      <div style={{ position: 'relative', width, height, ...style }}>
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          {...commonProps}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
        >
          <track kind="captions" />
        </video>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width, height, ...style }}>
      <audio
        ref={mediaRef as React.RefObject<HTMLAudioElement>}
        {...commonProps}
        style={{ width: '100%', maxWidth: '500px' }}
      >
        <track kind="captions" />
      </audio>
    </div>
  );
};

export default MediaComponent;
