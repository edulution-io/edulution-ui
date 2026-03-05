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

import IMAGE_UPLOAD_ALLOWED_MIME_TYPES from '@libs/common/constants/imageUploadAllowedMimeTypes';

const convertImageFileToCompressedWebp = async (
  file: File,
  maxSizeKB: number,
  maxDimension?: number,
): Promise<File> => {
  if (!IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(file.type) || !file.type.startsWith('image/')) return file;

  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });

    let width = image.naturalWidth || image.width;
    let height = image.naturalHeight || image.height;
    if (maxDimension && (width > maxDimension || height > maxDimension)) {
      const aspectRatio = width / height;
      if (width > height) {
        width = maxDimension;
        height = Math.round(maxDimension / aspectRatio);
      } else {
        height = maxDimension;
        width = Math.round(maxDimension * aspectRatio);
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return file;

    context.drawImage(image, 0, 0, width, height);

    const compressToBlob = async (q: number): Promise<Blob | null> => {
      const b = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((result) => resolve(result), 'image/webp', q);
      });
      if (b && b.size > maxSizeKB * 1024 && q > 0.1) {
        return compressToBlob(Math.round((q - 0.1) * 10) / 10);
      }
      return b;
    };

    const blob = await compressToBlob(0.9);

    if (!blob) return file;

    return new File([blob], `${file.name.replace(/\.[^.]+$/i, '')}.webp`, { type: 'image/webp' });
  } catch {
    return file;
  }
};

export default convertImageFileToCompressedWebp;
