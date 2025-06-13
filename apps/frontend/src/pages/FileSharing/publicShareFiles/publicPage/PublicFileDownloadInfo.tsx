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
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import downloadPublicFile from '@libs/filesharing/utils/downloadPublicFile';
import FileHeader from './components/FileHeader';
import PublicFilePasswordInput from '@/pages/FileSharing/publicShareFiles/publicPage/components/PublicFilePasswordInput';
import DownloadPublicFile from '@/pages/FileSharing/publicShareFiles/publicPage/components/DownloadPublicFile';
import FileMetaList from '@/pages/FileSharing/publicShareFiles/publicPage/components/FileMetaList';
import { useTranslation } from 'react-i18next';

const schema = z.object({ password: z.string() });
type FormValues = z.infer<typeof schema>;

interface PublicFileDownloadInfoProps {
  filename: string;
  creator: string;
  expires: Date;
  absoluteUrl: string;
  isPasswordRequired: boolean;
  authToken?: string;
}

export const PublicFileDownloadInfo: React.FC<PublicFileDownloadInfoProps> = (props) => {
  const { filename, creator, expires, absoluteUrl, isPasswordRequired, authToken } = props;

  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' },
  });

  const { handleSubmit } = form;

  const onDownload = handleSubmit(({ password }) =>
    downloadPublicFile(
      absoluteUrl,
      filename,
      password,
      () =>
        form.setError('password', {
          type: 'server',
          message: t('filesharing.publicFileSharing.errors.PublicFileWrongPassword'),
        }),
      authToken,
    ),
  );

  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative w-full max-w-md rounded-3xl bg-white/10 p-8 shadow-xl shadow-black/50 ring-1 ring-white/10 backdrop-blur">
        <FileHeader
          filename={filename}
          creator={creator}
        />

        {isPasswordRequired && (
          <FormProvider {...form}>
            <PublicFilePasswordInput placeholder={t('conferences.password')} />
          </FormProvider>
        )}

        <DownloadPublicFile
          onClick={onDownload}
          label={t('filesharing.publicFileSharing.downloadPublicFile')}
        />

        <FileMetaList expires={expires} />
      </div>
    </div>
  );
};

export default PublicFileDownloadInfo;
