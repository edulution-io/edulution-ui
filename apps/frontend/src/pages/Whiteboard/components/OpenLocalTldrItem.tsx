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

import React, { useEffect, useRef } from 'react';
import { TldrawUiMenuItem } from 'tldraw';
import { useTranslation } from 'react-i18next';
import useWhiteboardEditorStore from '@/pages/Whiteboard/useWhiteboardEditorStore';
import FileExtensionTypes from '@libs/filesharing/constants/fileExtensionTypes';

const OpenLocalTldrItem: React.FC = () => {
  const { t } = useTranslation();
  const { openTldrFromBlobUrl } = useWhiteboardEditorStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = FileExtensionTypes.TLDR;
    input.style.display = 'none';
    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const blobUrl = URL.createObjectURL(file);
      await openTldrFromBlobUrl(blobUrl, file.name);
    };
    document.body.appendChild(input);
    fileInputRef.current = input;

    return () => {
      document.body.removeChild(input);
    };
  }, [openTldrFromBlobUrl]);

  const handleSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <TldrawUiMenuItem
      id="openLocalTldrItem"
      label={t('common.openLocal')}
      readonlyOk
      onSelect={handleSelect}
    />
  );
};

export default OpenLocalTldrItem;
