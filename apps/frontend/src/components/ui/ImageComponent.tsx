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

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ImageComponentProps {
  downloadLink: string;
  altText: string;
  placeholder?: string;
}

const ImageComponent: React.FC<ImageComponentProps> = ({ downloadLink, altText, placeholder }) => {
  const [src, setSrc] = useState(downloadLink);
  const [error, setError] = useState(false);
  const { t } = useTranslation();
  const handleError = () => {
    if (placeholder) {
      setSrc(placeholder);
    }
    setError(true);
  };

  return (
    <div className="relative w-full">
      <img
        src={src}
        alt={altText}
        onError={handleError}
        className={`h-auto w-full ${error ? 'border-text-ciRed border' : 'border'}`}
      />
      {error && <p className="text-text-ciRed">{t('preview.failedToLoadImage')}</p>}
    </div>
  );
};

export default ImageComponent;
