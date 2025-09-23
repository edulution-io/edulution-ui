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

import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import React from 'react';
import type { z } from 'zod';
import { type DefaultValues, type FieldPath, useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface SaveDialogBodyProps<TValues extends { filename: string }> {
  form: UseFormReturn<TValues>;
}

interface SaveExternalFileDialogGenericProps<TSchema extends z.ZodType<{ filename: string }>> {
  isOpen: boolean;
  title: string;
  Body: React.ComponentType<SaveDialogBodyProps<z.infer<TSchema>>>;
  schema: TSchema;
  defaultValues: DefaultValues<z.infer<TSchema>>;
  onClose: () => void;

  normalizeFilename?: (raw: string) => string;
  buildFile: (normalizedName: string) => Promise<File | Blob>;
  onSave: (file: File | Blob, normalizedName: string) => Promise<void>;

  submitLabel?: string;
}

const SaveExternalFileDialogGeneric = <TSchema extends z.ZodType<{ filename: string }>>(
  props: SaveExternalFileDialogGenericProps<TSchema>,
) => {
  type TValues = z.infer<TSchema>;

  const {
    isOpen,
    title,
    Body,
    schema,
    defaultValues,
    onClose,
    normalizeFilename,
    buildFile,
    onSave,
    submitLabel = 'common.save',
  } = props;

  const form = useForm<TValues>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { t } = useTranslation();

  const { isValid } = form.formState;

  const handleClose = () => {
    onClose();
    form.reset(defaultValues);
  };

  const handleSubmit = async () => {
    try {
      const key = 'filename' as FieldPath<TValues>;
      const raw = (form.getValues(key) ?? '').toString().trim();
      if (!raw) return;

      const name = normalizeFilename ? normalizeFilename(raw) : raw;
      const blob = await buildFile(name);
      const file =
        blob instanceof File
          ? blob
          : new File([blob], name, {
              type: (blob).type || RequestResponseContentType.APPLICATION_OCTET_STREAM,
            });

      await onSave(file, name);
      toast.success(t('saveExternalFileDialogBody.fileSavedSuccessful'));
    } catch {
      toast.success(t('saveExternalFileDialogBody.fileSaveFailed'));
    } finally {
      onClose();
    }
  };

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      title={title}
      body={<Body form={form} />}
      footer={
        <DialogFooterButtons
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          submitButtonText={submitLabel}
          submitButtonType="submit"
          disableSubmit={!isValid}
        />
      }
      handleOpenChange={handleClose}
    />
  );
};

export default SaveExternalFileDialogGeneric;
