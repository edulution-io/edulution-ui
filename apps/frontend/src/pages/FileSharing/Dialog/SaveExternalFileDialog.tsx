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

import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import React from 'react';
import type { z } from 'zod';
import { type DefaultValues, type FieldPath, useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';

interface SaveDialogBodyProps<TValues extends { filename: string }> {
  form: UseFormReturn<TValues>;
}

interface SaveExternalFileDialogProps<TSchema extends z.ZodType<{ filename: string }>> {
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

const SaveExternalFileDialog = <TSchema extends z.ZodType<{ filename: string }>>(
  props: SaveExternalFileDialogProps<TSchema>,
) => {
  type TValues = z.infer<TSchema>;

  const { moveOrCopyItemToPath } = useFileSharingDialogStore();

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
              type: blob.type || RequestResponseContentType.APPLICATION_OCTET_STREAM,
            });

      await onSave(file, name);
      toast.success(t('saveExternalFileDialogBody.fileSavedSuccessful'));
    } catch {
      toast.success(t('saveExternalFileDialogBody.fileSaveFailed'));
    } finally {
      onClose();
    }
  };

  const isSaveDestinationSet = !!moveOrCopyItemToPath?.filename && moveOrCopyItemToPath.filename.length > 0;

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
          disableSubmit={!isValid || !isSaveDestinationSet}
        />
      }
      handleOpenChange={handleClose}
    />
  );
};

export default SaveExternalFileDialog;
