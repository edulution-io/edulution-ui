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

import React, { useEffect } from 'react';
import { Button } from '@/components/shared/Button';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import { toast } from 'sonner';
import usePublicConferenceStore from '@/pages/ConferencePage/PublicConference/usePublicConferenceStore';
import useUserStore from '@/store/UserStore/useUserStore';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/useConferenceDetailsDialogStore';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import PublicAccessFormHeader from '@/components/shared/PublicAccessFormHeader';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import { decodeBase64 } from '@libs/common/utils/getBase64String';

interface PublicConferenceJoinFormProps {
  meetingId: string;
  joinConference: () => Promise<void>;
  isPermittedUser: boolean;
  form: UseFormReturn<{ name: string; password: string }>;
  isWaitingForConferenceToStart: boolean;
  setWaitingForConferenceToStart: (value: ((prevState: boolean) => boolean) | boolean) => void;
  publicConference: Partial<ConferenceDto> | null;
  updatePublicConference: () => Promise<Partial<ConferenceDto> | null>;
}

const PublicConferenceJoinForm = ({
  meetingId,
  joinConference,
  isPermittedUser,
  form,
  isWaitingForConferenceToStart,
  setWaitingForConferenceToStart,
  publicConference,
  updatePublicConference,
}: PublicConferenceJoinFormProps) => {
  const { t } = useTranslation();
  const { publicUserFullName, storedPasswordsByMeetingIds, setStoredPasswordByMeetingId, setPublicUserFullName } =
    usePublicConferenceStore();
  const { joinConferenceUrl } = useConferenceDetailsDialogStore();
  const { user } = useUserStore();

  const joinConferenceManually = async () => {
    const currentPublicConference = await updatePublicConference();

    if (!currentPublicConference?.isRunning) {
      toast.error(t('conferences.errors.ConferenceIsNotRunning'));
      setWaitingForConferenceToStart(true);
      return;
    }

    await joinConference();
  };

  useEffect(() => {
    form.setValue('name', publicUserFullName || '');
    form.setValue('password', decodeBase64(storedPasswordsByMeetingIds[meetingId] || ''));
  }, [storedPasswordsByMeetingIds, meetingId, publicConference]);

  if (!isWaitingForConferenceToStart && publicConference?.isRunning && isPermittedUser && user) {
    return (
      <div className="mt-10 space-y-3">
        <Button
          variant="btn-infrastructure"
          size="lg"
          onClick={() => joinConferenceManually()}
        >
          {t('conferences.joinAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className="my-10 rounded-xl bg-white bg-opacity-5 p-5">
      <PublicAccessFormHeader />
      {isWaitingForConferenceToStart && !joinConferenceUrl ? (
        <>
          <div>{t('conferences.conferenceIsNotStartedYet')}</div>
          <Button
            className="mt-4"
            variant="btn-outline"
            size="lg"
            onClick={() => joinConferenceManually()}
          >
            {t('conferences.tryManually')}
          </Button>
          <div className="my-20 flex justify-center">
            <CircleLoader transitionDurationMS={3000} />
          </div>
        </>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(joinConferenceManually)}>
            {!user?.username && (
              <div className="mb-4">
                <div className="mb-2">{t('conferences.pleaseEnterYourFullName')}</div>
                <FormField
                  name="name"
                  form={form}
                  value={publicUserFullName}
                  onChange={(e) => setPublicUserFullName(e.target.value)}
                  placeholder={t('conferences.yourFullName')}
                  rules={{
                    required: t('common.min_chars', { count: 3 }),
                    minLength: {
                      value: 3,
                      message: t('common.min_chars', { count: 3 }),
                    },
                  }}
                  variant="dialog"
                />
              </div>
            )}

            {publicConference?.password && (
              <div>
                <div className="mb-2">{t('conferences.conferenceIsPasswordProtected')}</div>
                <FormField
                  name="password"
                  type="password"
                  form={form}
                  onChange={(e) => setStoredPasswordByMeetingId(meetingId, e.target.value)}
                  value={decodeBase64(storedPasswordsByMeetingIds[meetingId] || '')}
                  placeholder={t('conferences.passwordOfConference')}
                  rules={{
                    required: t('common.min_chars', { count: 1 }),
                  }}
                  variant="dialog"
                />
              </div>
            )}
            <DialogFooterButtons
              submitButtonText="common.join"
              submitButtonType="submit"
              handleSubmit={form.handleSubmit(joinConferenceManually)}
            />
          </form>
        </Form>
      )}
    </div>
  );
};

export default PublicConferenceJoinForm;
