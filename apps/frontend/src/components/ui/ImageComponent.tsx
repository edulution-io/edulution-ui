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
