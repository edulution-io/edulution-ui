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
