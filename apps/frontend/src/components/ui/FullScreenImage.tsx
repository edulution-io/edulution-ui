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
import { useTranslation } from 'react-i18next';

const FullScreenImage = ({ imageSrc }: { imageSrc: string }) => {
  const { t } = useTranslation();
  return (
    <div className="flex h-full w-full items-center justify-center bg-foreground">
      <img
        src={imageSrc}
        alt={t('preview.image')}
        className="max-h-full max-w-full rounded-md"
      />
    </div>
  );
};

export default FullScreenImage;
