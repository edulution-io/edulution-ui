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
import { UseFormReturn } from 'react-hook-form';
import { Theme } from '@libs/common/constants/theme';
import ThemedFile from '@libs/common/types/themedFile';
import UploadImageVariant from '@/pages/Settings/components/UploadImageVariant';

export type UploadImageWithPreviewProps = {
  settingLocation: string;
  fieldPath: string;
  form: UseFormReturn<ThemedFile>;
};

const UploadImageWithPreview: React.FC<UploadImageWithPreviewProps> = ({ settingLocation, fieldPath, form }) => (
  <div className="flex min-w-[480px] flex-grow flex-row gap-4">
    <UploadImageVariant
      variant={Theme.light}
      settingLocation={settingLocation}
      fieldPath={fieldPath}
      form={form}
    />
    <UploadImageVariant
      variant={Theme.dark}
      settingLocation={settingLocation}
      fieldPath={fieldPath}
      form={form}
    />
  </div>
);

export default UploadImageWithPreview;
