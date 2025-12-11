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
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import { FileTableStore } from '@libs/appconfig/types/fileTableStore';
import type FileInfoDto from '@libs/appconfig/types/fileInfo.dto';
import TABLE_CONFIG_MAP from '@/pages/Settings/AppConfig/components/table/tableConfigMap';
import { ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import createAppConfigTableEntry from './createAppConfigTableEntry';
import useFileTableStore from '../useFileTableStore';
import FileTableColumns from '../FileTableColumns';
import UploadFileDialog from '../UploadFileDialog';

const getAppConfigTableConfig = (appName: string, tableId: ExtendedOptionKeysType) => {
  if (!(appName in TABLE_CONFIG_MAP)) {
    const dynamicConfigs = createAppConfigTableEntry<FileInfoDto, FileTableStore>({
      columns: FileTableColumns,
      useStore: useFileTableStore,
      dialogBody: (
        <UploadFileDialog
          settingLocation={appName}
          tableId={tableId}
        />
      ),
      showAddButton: true,
      showRemoveButton: true,
      filterKey: 'filename',
      filterPlaceHolderText: 'filesharing.filterPlaceHolderText',
      type: ExtendedOptionKeys.EMBEDDED_PAGE_HTML_CONTENT,
      hideColumnsInMobileView: [],
      hideColumnsInTabletView: [],
    });

    return dynamicConfigs;
  }

  return TABLE_CONFIG_MAP[appName as keyof typeof TABLE_CONFIG_MAP].filter(
    (tableConfig) => tableConfig.type === tableId,
  )[0];
};

export default getAppConfigTableConfig;
