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

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import cn from '@libs/common/utils/className';
import DeleteButton from '@/components/shared/Card/DeleteButton';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import THEME from '@libs/common/constants/theme';
import FileSelectButton from '@/components/ui/FileSelectButton';
import { ResponseType } from '@libs/common/types/http-methods';

type AssetSource = 'custom' | 'fallback' | 'none';

interface AssetWithConditionalDeleteProps {
  assetUrl: string;
  alt?: string;
  onDelete?: () => Promise<void>;
  className?: string;
  cacheKey?: number;
  inputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasLocalSelection?: boolean;
  chooseText?: string;
  changeText?: string;
  accept?: string;
  uploading?: boolean;
  variant?: typeof THEME.light | typeof THEME.dark;
}

const AssetWithConditionalDelete: React.FC<AssetWithConditionalDeleteProps> = ({
  assetUrl,
  alt = 'Update Image Asset',
  onDelete,
  className,
  cacheKey,
  inputRef,
  onFileChange,
  hasLocalSelection,
  chooseText,
  changeText,
  accept,
  uploading = false,
  variant = THEME.light,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [assetSource, setAssetSource] = useState<AssetSource>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAsset = async () => {
    if (!blobUrl) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(blobUrl, {
        responseType: ResponseType.BLOB,
      });

      if (!response) {
        throw new Error('No response from server');
      }

      const source = (response.headers['x-asset-source'] as AssetSource) || 'none';
      setAssetSource(source);

      const blob = response.data as Blob;
      const newblobUrl = URL.createObjectURL(blob);

      setBlobUrl(newblobUrl);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch asset'));
      setBlobUrl(null);
      setAssetSource('none');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!assetUrl) {
      setBlobUrl(null);
      setAssetSource('none');
    }
    setBlobUrl(assetUrl);

    void fetchAsset();
  }, [assetUrl]);

  const shouldShowDeleteButton = assetSource === 'custom' && onDelete;

  const loading = isLoading || uploading;

  return (
    <div
      className={cn(
        'w-min-[400px] relative flex flex-col items-center rounded-2xl border border-dashed border-gray-300 p-6 text-center shadow-sm hover:border-gray-400',
        { 'bg-white': variant === THEME.light },
        { 'bg-neutral-900': variant === THEME.dark },
        loading && 'pointer-events-none opacity-60',
        className,
      )}
      aria-busy={loading}
      aria-live="polite"
    >
      {shouldShowDeleteButton && (
        <div className="absolute right-4 top-4">
          <DeleteButton onDelete={onDelete} />
        </div>
      )}

      {blobUrl ? (
        <img
          key={cacheKey}
          src={assetUrl}
          alt={alt}
          className="h-full w-full object-contain"
        />
      ) : (
        <CircleLoader className="mx-auto h-20" />
      )}

      <div className="mt-3 grid w-full grid-cols-1 gap-2">
        <FileSelectButton
          ref={inputRef}
          accept={accept}
          onChange={onFileChange}
          hasSelection={hasLocalSelection}
          chooseText={chooseText}
          changeText={changeText}
          labelClassName="w-full border-none"
          disabled={loading}
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{`Error loading asset: ${error.message}`}</p>}
    </div>
  );
};

export default AssetWithConditionalDelete;
