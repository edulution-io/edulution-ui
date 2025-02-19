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
import CreateConferenceDialogBody from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogBody';
import { Button } from '@/components/shared/Button';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import ConferencesForm from '@libs/conferences/types/conferencesForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import AttendeeDto from '@libs/user/types/attendee.dto';
import useUserStore from '@/store/UserStore/UserStore';
import getConferencesFormSchema from '@libs/conferences/constants/formSchema';
import stringToBoolean from '@libs/common/utils/stringToBoolean';
import CONFERENCES_IS_PUBLIC_FORM_VALUES from '@libs/conferences/constants/isPublicFormValues';
import QRCodeWithCopyButton from '@/components/ui/QRCodeWithCopyButton';
import { CONFERENCES_PUBLIC_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import UseIsMobileView from '@/hooks/useIsMobileView';
import CircleLoader from '@/components/ui/CircleLoader';
import Separator from '@/components/ui/Separator';

interface ConferenceDetailsDialogProps {
  trigger?: React.ReactNode;
}

const ConferenceDetailsDialog = ({ trigger }: ConferenceDetailsDialogProps) => {
  const { t } = useTranslation();
  const isMobileView = UseIsMobileView();
  const { user } = useUserStore();
  const { getConferences } = useConferenceStore();
  const { isLoading, selectedConference, setSelectedConference, updateConference } = useConferenceDetailsDialogStore();

  const initialFormValues: ConferencesForm = {
    name: selectedConference?.name || '',
    password: selectedConference?.password || '',
    isPublic: selectedConference?.isPublic
      ? CONFERENCES_IS_PUBLIC_FORM_VALUES[1].value
      : CONFERENCES_IS_PUBLIC_FORM_VALUES[0].value,
    invitedAttendees: selectedConference?.invitedAttendees.filter((ia) => ia.username !== user?.username) || [],
    invitedGroups: selectedConference?.invitedGroups || [],
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
      invitedAttendees: [...form.getValues('invitedAttendees'), { username: user?.username } as AttendeeDto],
      invitedGroups: form.getValues('invitedGroups'),
      meetingID: selectedConference?.meetingID,
    };

    await updateConference(newConference);
    await getConferences();
    form.reset();
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);
  const getDialogBody = () => {
    if (isLoading || !selectedConference) return <CircleLoader className="mx-auto mt-5" />;

    const showQrCode = !!selectedConference.meetingID && stringToBoolean(form.watch('isPublic'));

    return (
      <>
        <CreateConferenceDialogBody form={form} />
        <Separator />
        {showQrCode && (
          <QRCodeWithCopyButton
            qrCodeSize={isMobileView ? 'md' : 'lg'}
            url={`${window.location.origin}/${CONFERENCES_PUBLIC_EDU_API_ENDPOINT}/${selectedConference.meetingID}`}
            titleTranslationId="conferences.joinUrl"
          />
        )}
      </>
    );
  };

  const getFooter = () => (
    <div className="mt-4 flex justify-end">
      <form onSubmit={handleFormSubmit}>
        <Button
          variant="btn-collaboration"
          disabled={isLoading}
          size="lg"
          type="submit"
        >
          {t('common.save')}
        </Button>
      </form>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen
      trigger={trigger}
      handleOpenChange={() => setSelectedConference(null)}
      title={t('conferences.editConference')}
      desktopContentClassName="max-w-4xl"
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default ConferenceDetailsDialog;
