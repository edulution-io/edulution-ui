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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/useCreateConferenceDialogStore';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CreateConferenceDialogBody from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogBody';
import ConferencesForm from '@libs/conferences/types/conferencesForm';
import useConferenceStore from '@/pages/ConferencePage/useConferenceStore';
import getConferencesFormSchema from '@libs/conferences/constants/formSchema';
import stringToBoolean from '@libs/common/utils/stringToBoolean';
import CONFERENCES_IS_PUBLIC_FORM_VALUES from '@libs/conferences/constants/isPublicFormValues';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

interface CreateConferenceDialogProps {
  trigger?: React.ReactNode;
}

const CreateConferenceDialog = ({ trigger }: CreateConferenceDialogProps) => {
  const {
    isCreateConferenceDialogOpen,
    openCreateConferenceDialog,
    closeCreateConferenceDialog,
    isLoading,
    createConference,
  } = useCreateConferenceDialogStore();
  const { getConferences } = useConferenceStore();

  const { t } = useTranslation();

  const initialFormValues: ConferencesForm = {
    name: '',
    password: '',
    isPublic: CONFERENCES_IS_PUBLIC_FORM_VALUES[0].value,
    invitedAttendees: [],
    invitedGroups: [],
  };

  const form = useForm<ConferencesForm>({
    mode: 'onChange',
    resolver: zodResolver(getConferencesFormSchema(t)),
    defaultValues: initialFormValues,
  });

  const onSubmit = async () => {
    const newConference = {
      name: form.getValues('name'),
      password: form.getValues('password'),
      isPublic: stringToBoolean(form.getValues('isPublic')),
      invitedAttendees: form.getValues('invitedAttendees'),
      invitedGroups: form.getValues('invitedGroups'),
    };

    await createConference(newConference);
    await getConferences();
    form.reset();
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const getDialogBody = () => {
    if (isLoading) return <CircleLoader className="mx-auto mt-5" />;
    return <CreateConferenceDialogBody form={form} />;
  };

  const getFooter = () => (
    <form onSubmit={handleFormSubmit}>
      <DialogFooterButtons
        handleClose={() => closeCreateConferenceDialog()}
        handleSubmit={() => {}}
        submitButtonText="common.save"
        submitButtonType="submit"
        disableSubmit={isLoading}
      />
    </form>
  );

  return (
    <AdaptiveDialog
      isOpen={isCreateConferenceDialogOpen}
      trigger={trigger}
      handleOpenChange={isCreateConferenceDialogOpen ? closeCreateConferenceDialog : openCreateConferenceDialog}
      title={t('conferences.create')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default CreateConferenceDialog;
