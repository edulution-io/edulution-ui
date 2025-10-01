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
import { useTranslation } from 'react-i18next';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import { UseFormReturn } from 'react-hook-form';
import { SaveExternalFileFormValues } from '@libs/filesharing/types/saveExternalFileFormSchema';
import ContentType from '@libs/filesharing/types/contentType';
import MoveContentDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/MoveContentDialogBody';

type Props = { form: UseFormReturn<SaveExternalFileFormValues> };

const SaveExternalFileDialogBody: React.FC<Props> = ({ form }) => {
  const { t } = useTranslation();

  return (
    <>
      <MoveContentDialogBody
        showAllFiles={false}
        showSelectedFile
        showHome
        fileType={ContentType.DIRECTORY}
        isCurrentPathDefaultDestination
      />

      <div className="mt-4">
        <Form {...form}>
          <FormField
            name="filename"
            form={form}
            labelTranslationId="saveExternalFileDialogBody.filename"
            variant="dialog"
            placeholder={t('saveExternalFileDialogBody.filenamePlaceholder')}
          />
        </Form>
      </div>
    </>
  );
};

export default SaveExternalFileDialogBody;
