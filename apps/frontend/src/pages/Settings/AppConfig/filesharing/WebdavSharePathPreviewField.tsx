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
import { DropdownOptions } from '@/components/ui/DropdownSelect/DropdownSelect';
import { FormLabel } from '@/components/ui/Form';
import appendSlashToUrl from '@libs/common/utils/URL/appendSlashToUrl';
import WEBDAV_SHARE_TABLE_COLUMNS from '@libs/filesharing/constants/webdavShareTableColumns';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import useWebdavServerConfigTableStore from './useWebdavServerConfigTableStore';

type WebdavSharePathPreviewFieldProps = {
  ldapFieldsEnabled: boolean;
  variableList: (DropdownOptions & { value: string })[];
  form: UseFormReturn<WebdavShareDto>;
};

const WebdavSharePathPreviewField: React.FC<WebdavSharePathPreviewFieldProps> = ({
  form,
  variableList,
  ldapFieldsEnabled,
}) => {
  const { t } = useTranslation();
  const [sharePathValue, setSharePathValue] = useState('');
  const tableContentData = useWebdavServerConfigTableStore((s) => s.tableContentData);

  const findVarValue = (variable: string) => {
    if (ldapFieldsEnabled) return variableList.find((item) => item.id === variable)?.value ?? '';
    return '';
  };

  const rootServer = useWatch({
    control: form.control,
    name: WEBDAV_SHARE_TABLE_COLUMNS.ROOT_SERVER,
  });

  const sharePath = useWatch({
    control: form.control,
    name: WEBDAV_SHARE_TABLE_COLUMNS.SHARE_PATH,
  });

  const variable = useWatch({
    control: form.control,
    name: WEBDAV_SHARE_TABLE_COLUMNS.VARIABLE,
  });

  const getInputValue = useCallback((): string => {
    const selectedRootServer = tableContentData.find((server) => server.webdavShareId === rootServer)?.url;

    if (!selectedRootServer) return '';

    const variableResolved = findVarValue(variable);
    return `${selectedRootServer}${appendSlashToUrl(sharePath)}${variableResolved}`;
  }, [tableContentData, rootServer, sharePath, variable]);

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
      />
    </>
  );
};

export default WebdavSharePathPreviewField;
