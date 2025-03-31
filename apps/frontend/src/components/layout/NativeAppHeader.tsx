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
import { NATIVE_APP_HEADER_ID } from '@libs/common/constants/pageElementIds';
import PageTitle from '@/components/PageTitle';

interface NativeAppHeaderProps {
  title: string;
  description?: string;
  iconSrc: string;
}

const NativeAppHeader = ({ title, iconSrc, description }: NativeAppHeaderProps) => {
  const { t } = useTranslation();
  return (
    <div
      className="mr-2 flex min-h-[6.25rem] text-background xl:max-h-[6.25rem]"
      id={NATIVE_APP_HEADER_ID}
    >
      <PageTitle translationId={title} />
      <img
        src={iconSrc}
        alt={`${title} ${t('common.icon')}`}
        className="hidden h-20 w-20 object-contain md:block"
      />
      <div className="ml-4">
        <h2>{title}</h2>
        <div className="pt-5 sm:pt-0">{description && <p className="pb-4">{description}</p>}</div>
      </div>
    </div>
  );
};

export default NativeAppHeader;
