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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';

interface UploadFileDialogProps {
  settingLocation: string;
}

const UploadFileDialog: React.FC<UploadFileDialogProps> = ({ settingLocation }) => {
  const { t } = useTranslation();
  const [isOpen, setDialogOpen] = useState(false);
  console.warn(settingLocation);

  const getDialogBody = () => <div />;

  return (
    <AdaptiveDialog
      title={t(`containerApplication.dialogTitle`, { applicationName: t(`${settingLocation}.sidebar`) })}
      isOpen={isOpen}
      body={getDialogBody()}
      handleOpenChange={() => setDialogOpen((prev) => !prev)}
    />
  );
};

export default UploadFileDialog;
