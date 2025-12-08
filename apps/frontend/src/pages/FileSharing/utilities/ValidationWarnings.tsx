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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { HiExclamationTriangle } from 'react-icons/hi2';
import WarningBox from '@/components/shared/WarningBox';

interface ValidationWarningsProps {
  oversizedFiles: File[];
  duplicateFiles: string[];
  tooLargeFolders: string[];
}

const ValidationWarnings: React.FC<ValidationWarningsProps> = ({ oversizedFiles, duplicateFiles, tooLargeFolders }) => {
  const { t } = useTranslation();

  const hasMultipleDuplicates = duplicateFiles.length > 1;
  const hasMultipleOversizedFiles = oversizedFiles.length > 1;

  return (
    <>
      {duplicateFiles.length > 0 && (
        <WarningBox
          icon={<HiExclamationTriangle className="text-ciYellow" />}
          title={
            hasMultipleDuplicates
              ? t('filesharingUpload.overwriteWarningTitleFiles')
              : t('filesharingUpload.overwriteWarningTitleFile')
          }
          description={
            hasMultipleDuplicates
              ? t('filesharingUpload.overwriteWarningDescriptionFiles')
              : t('filesharingUpload.overwriteWarningDescriptionFile')
          }
          filenames={duplicateFiles}
          borderColor="border-ciLightYellow"
          backgroundColor="bg-background"
          textColor="text-ciLightYellow"
        />
      )}

      {oversizedFiles.length > 0 && (
        <WarningBox
          icon={<HiExclamationTriangle className="text-ciRed" />}
          title={
            hasMultipleOversizedFiles
              ? t('filesharingUpload.oversizedFilesDetected')
              : t('filesharingUpload.oversizedFileDetected')
          }
          description={t('filesharingUpload.cannotUploadOversized')}
          filenames={oversizedFiles.map((file) => file.name)}
          borderColor="border-ciLightRed"
          backgroundColor="bg-background"
          textColor="text-ciLightRed"
        />
      )}

      {tooLargeFolders.length > 0 && (
        <WarningBox
          icon={<HiExclamationTriangle className="text-ciRed" />}
          title={t('filesharingUpload.folderTooLargeTitle')}
          description={t('filesharingUpload.folderTooLargeDescription')}
          filenames={tooLargeFolders}
          borderColor="border-ciRed"
          backgroundColor="bg-background"
          textColor="text-ciRed"
        />
      )}
    </>
  );
};

export default ValidationWarnings;
