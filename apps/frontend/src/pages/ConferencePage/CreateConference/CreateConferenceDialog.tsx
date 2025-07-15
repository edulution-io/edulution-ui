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
    <div className="mt-4 flex justify-end">
      <form onSubmit={handleFormSubmit}>
        <DialogFooterButtons
          handleClose={() => closeCreateConferenceDialog()}
          handleSubmit={() => {}}
          submitButtonText="common.save"
          submitButtonType="submit"
          disableSubmit={isLoading}
        />
      </form>
    </div>
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
