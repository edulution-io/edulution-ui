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

import React, { useEffect, useRef, memo, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import FileIconComponent from './FileIconComponent';
import useThumbnailCache from './useThumbnailCache';

interface FileThumbnailProps {
  filePath: string;
  etag: string;
  size: number;
}

const FileThumbnail = memo(({ filePath, etag, size }: FileThumbnailProps) => {
  const { webdavShare } = useParams();

  const cacheKey = useMemo(() => `${filePath}:${etag}`, [filePath, etag]);

  const cachedUrl = useThumbnailCache((s) => s.cache.get(cacheKey));
  const failed = useThumbnailCache((s) => s.failedRequests.has(cacheKey));
  const pending = useThumbnailCache((s) => s.pendingRequests.has(cacheKey));
  const fetchThumbnail = useThumbnailCache((s) => s.fetchThumbnail);

  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cachedUrl || failed || pending || !webdavShare) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          void fetchThumbnail(filePath, etag, webdavShare);
        }
      },
      { rootMargin: '100px' },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [cachedUrl, failed, pending, filePath, etag, webdavShare, fetchThumbnail]);

  if (failed) {
    return (
      <FileIconComponent
        filename={filePath}
        size={size}
      />
    );
  }

  if (cachedUrl) {
    return (
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden rounded"
        style={{ width: size, height: size }}
      >
        <img
          src={cachedUrl}
          alt=""
          className="size-full rounded object-cover"
          style={{ width: size, height: size }}
        />
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className="flex shrink-0 items-center justify-center overflow-hidden rounded"
      style={{ width: size, height: size }}
    >
      <div
        className="animate-pulse rounded bg-muted"
        style={{ width: size, height: size }}
      />
    </div>
  );
});

FileThumbnail.displayName = 'FileThumbnail';

export default FileThumbnail;
