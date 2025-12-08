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

import React, { useCallback, useEffect, useState } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Input from '@/components/shared/Input';
import { FormLabel } from '@/components/ui/Form';
import WEBDAV_SHARE_TABLE_COLUMNS from '@libs/filesharing/constants/webdavShareTableColumns';
import type WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import useVariableSharePathname from '@/pages/FileSharing/hooks/useVariableSharePathname';
import useWebdavServerConfigTableStore from './useWebdavServerConfigTableStore';

type WebdavSharePathPreviewFieldProps = {
  form: UseFormReturn<WebdavShareDto>;
};

const WebdavSharePathPreviewField: React.FC<WebdavSharePathPreviewFieldProps> = ({ form }) => {
  const { t } = useTranslation();
  const [sharePathValue, setSharePathValue] = useState('');
  const tableContentData = useWebdavServerConfigTableStore((s) => s.tableContentData);
  const { createVariableSharePathname } = useVariableSharePathname();

  const rootServer = useWatch({
    control: form.control,
    name: WEBDAV_SHARE_TABLE_COLUMNS.ROOT_SERVER,
  });

  const sharePath = useWatch({
    control: form.control,
    name: WEBDAV_SHARE_TABLE_COLUMNS.SHARE_PATH,
  });

  const pathVariables = useWatch({
    control: form.control,
    name: WEBDAV_SHARE_TABLE_COLUMNS.PATH_VARIABLES,
  });

  const getInputValue = useCallback((): string => {
    const selectedRootServer = tableContentData.find((server) => server.webdavShareId === rootServer)?.url;

    if (!selectedRootServer) return '';

    const currentSharePath = createVariableSharePathname(sharePath, pathVariables);
    return `${selectedRootServer}${currentSharePath}`;
  }, [tableContentData, rootServer, sharePath, pathVariables, createVariableSharePathname]);

  useEffect(() => {
    setSharePathValue(getInputValue());
  }, [getInputValue]);

  return (
    <>
      <FormLabel>
        <p className="mt-4 font-bold text-background">{t(`webdavShare.pathPreview`)}</p>
      </FormLabel>
      <Input
        value={sharePathValue}
        variant="dialog"
        disabled
      />
    </>
  );
};

export default WebdavSharePathPreviewField;
