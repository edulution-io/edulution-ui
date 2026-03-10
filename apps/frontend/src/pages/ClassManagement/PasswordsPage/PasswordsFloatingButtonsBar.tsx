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
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import { faFileCsv, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import type FileExportFormat from '@libs/classManagement/types/fileExportFormat';
import { FILE_EXPORT_FORMAT } from '@libs/classManagement/types/fileExportFormat';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import { useTranslation } from 'react-i18next';
import PrintPasswordsDialog from './PrintPasswordsDialog';

interface FloatingButtonsBarProps {
  selectedClasses: LmnApiSchoolClass[];
}

const PasswordsFloatingButtonsBar: React.FC<FloatingButtonsBarProps> = ({ selectedClasses }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<FileExportFormat | null>(null);
  const { t } = useTranslation();

  if (!selectedClasses.length) {
    return null;
  }

  const config: FloatingButtonsBarConfig = {
    buttons: [
      {
        icon: faFilePdf,
        text: t(`classmanagement.${FILE_EXPORT_FORMAT.PDF}`),
        onClick: () => setIsDialogOpen(FILE_EXPORT_FORMAT.PDF),
      },
      {
        icon: faFileCsv,
        text: t(`classmanagement.${FILE_EXPORT_FORMAT.CSV}`),
        onClick: () => setIsDialogOpen(FILE_EXPORT_FORMAT.CSV),
      },
    ],
    keyPrefix: 'class-management-page-floating-button_',
  };

  return (
    <>
      <FloatingButtonsBar config={config} />
      {isDialogOpen ? (
        <PrintPasswordsDialog
          title={isDialogOpen}
          selectedClasses={selectedClasses}
          onClose={() => setIsDialogOpen(null)}
        />
      ) : null}
    </>
  );
};

export default PasswordsFloatingButtonsBar;
