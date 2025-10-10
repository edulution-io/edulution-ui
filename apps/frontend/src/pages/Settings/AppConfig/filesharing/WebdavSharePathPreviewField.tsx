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
  }, [tableContentData, rootServer, sharePath, pathVariables]);

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
