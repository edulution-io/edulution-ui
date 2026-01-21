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

import React, { useState, useEffect } from 'react';
import THEME from '@libs/common/constants/theme';
import AssetSource from '@libs/filesystem/types/AssetSource';
import AssetUploadField from '@/pages/Settings/components/AssetUploadField';
import useFilesystemStore from '@/store/FilesystemStore/useFilesystemStore';

interface AssetUploadFieldWithFetchProps {
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

const AssetUploadFieldWithFetch: React.FC<AssetUploadFieldWithFetchProps> = ({
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

  const { fetchImage, fetchingImageVariant } = useFilesystemStore();

  const reset = () => {
    setBlobUrl(null);
    setAssetSource('none');
  };

  const fetchAsset = async (url: string, currentVariant: typeof THEME.light | typeof THEME.dark) => {
    try {
      if (url) {
        const result = await fetchImage(url, currentVariant);
        if (result) {
          setBlobUrl(result.content);
          setAssetSource(result.source);
          return;
        }
      }
      reset();
    } catch (error) {
      reset();
    }
  };

  useEffect(() => {
    void fetchAsset(assetUrl, variant);
  }, [assetUrl, variant]);

  const shouldShowDeleteButton = assetSource === 'custom' && onDelete;

  const loading = fetchingImageVariant === variant || uploading;

  return (
    <AssetUploadField
      variant={variant}
      previewSrc={blobUrl || undefined}
      cacheKey={cacheKey}
      hasLocalSelection={hasLocalSelection}
      uploading={loading}
      inputRef={inputRef}
      onFileChange={onFileChange}
      chooseText={chooseText}
      changeText={changeText}
      accept={accept}
      alt={alt}
      fallbackSrc=""
      className={className}
      onHandleReset={shouldShowDeleteButton ? onDelete : undefined}
      isLoginPage={false}
    />
  );
};

export default AssetUploadFieldWithFetch;
