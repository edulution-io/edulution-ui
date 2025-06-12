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
import { usePublicShareFilesStore } from '@/pages/FileSharing/publicShareFiles/usePublicShareFilesStore';
import FormField from '@/components/shared/FormField';
import { t } from 'i18next';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Button } from '@/components/shared/Button';

const schema = z.object({
  password: z.string(),
});

type FormValues = z.infer<typeof schema>;

const PublicFileDownloadInfo = () => {
  const { publicShareFile, isPasswordRequired } = usePublicShareFilesStore();
  if (!publicShareFile) return null;
  const { filename, fileLink, validUntil, createdAt, creator } = publicShareFile;

  const apiPath = fileLink.startsWith('/') ? fileLink.slice(1) : fileLink;

  const absoluteUrl = apiPath.startsWith('/')
    ? `${window.location.origin}${apiPath}`
    : `${window.location.origin}/${apiPath}`;

  const passwordChangeForm = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' },
  });

  const password = passwordChangeForm.watch('password');

  const handleDownload = async () => {
    try {
      const res = await axios.post(
        absoluteUrl,
        { password },
        {
          responseType: 'blob',
          validateStatus: (s) => s < 300,
        },
      );
      const blobUrl = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const { status } = err.response;
        if (status === 401 || status === 403) {
          passwordChangeForm.setError('password', {
            type: 'server',
            message: t('filesharing.publicFileSharing.errors.PublicFileWrongPassword'),
          });
        }
      }
    }
  };

  return (
    <section className="flex items-start justify-center px-4 py-12 sm:px-10 lg:px-32">
      <article className="w-full max-w-2xl space-y-6 rounded-2xl bg-accent p-8 shadow-2xl backdrop-blur-md">
        <h2 className="truncate text-2xl font-semibold">{filename}</h2>
        <h3>{creator}</h3>

        {isPasswordRequired && (
          <div>
            <div className="mb-2">{t('conferences.conferenceIsPasswordProtected')}</div>
            <FormProvider {...passwordChangeForm}>
              <form>
                <FormField
                  name="password"
                  type="password"
                  labelTranslationId="common.newPassword"
                  variant="dialog"
                  form={passwordChangeForm}
                />
              </form>
            </FormProvider>
          </div>
        )}
        <Button
          onClick={handleDownload}
          className="block w-full rounded-lg bg-blue-600 py-3 text-lg font-medium text-background transition hover:bg-blue-700"
        >
          Datei herunterladen
        </Button>

        <ul className="space-y-1 text-sm">
          <li>
            <strong>Erstellt:</strong> {new Date(createdAt).toLocaleString('de-DE')}
          </li>
          <li>
            <strong>Gültig bis:</strong> {new Date(validUntil).toLocaleString('de-DE')}
          </li>
        </ul>
      </article>
    </section>
  );
};

export default PublicFileDownloadInfo;
