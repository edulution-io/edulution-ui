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

import React, { FC } from 'react';
import OnlyOfficeEditor from '@/pages/FileSharing/FilePreview/OnlyOffice/OnlyOfficeEditor';
import useOnlyOffice from '@/pages/FileSharing/hooks/useOnlyOffice';

interface OnlyOfficeProps {
  filePath: string;
  fileName: string;
  url: string;
  type: 'desktop' | 'mobile';
  mode: 'view' | 'edit';
  isOpenedInNewTab?: boolean;
}

const OnlyOffice: FC<OnlyOfficeProps> = ({ url, filePath, fileName, mode, type, isOpenedInNewTab }) => {
  const { documentServerURL, editorType, editorConfig } = useOnlyOffice({
    filePath,
    fileName,
    url,
    type,
    mode,
  });

  return (
    editorConfig && (
      <OnlyOfficeEditor
        documentServerURL={documentServerURL || ''}
        editorType={editorType}
        mode={mode}
        editorConfig={editorConfig}
        filePath={filePath}
        fileName={fileName}
        isOpenedInNewTab={isOpenedInNewTab}
      />
    )
  );
};

export default OnlyOffice;
