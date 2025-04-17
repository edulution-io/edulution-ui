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

import React, { useEffect } from 'react';
import { Button } from '@/components/shared/Button';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import { toast } from 'sonner';
import usePublicConferenceStore from '@/pages/ConferencePage/PublicConference/PublicConferenceStore';
import useUserStore from '@/store/UserStore/UserStore';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import PublicLoginButton from '@/pages/ConferencePage/PublicConference/PublicLoginButton';
import PublicJoinButton from '@/pages/ConferencePage/PublicConference/PublicJoinButton';
// import LOGIN_ROUTE from '@libs/auth/constants/loginRoute';

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
    form.setValue('password', atob(storedPasswordsByMeetingIds[meetingId] || ''));
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
      {/*{!user?.username && (*/}
      {/*  <div>*/}
      {/*    <Button*/}
      {/*      className="mx-auto mt-5 w-[200px] justify-center text-background shadow-xl"*/}
      {/*      type="submit"*/}
      {/*      variant="btn-security"*/}
      {/*      size="lg"*/}
      {/*      data-testid="test-id-login-page-submit-button"*/}
      {/*      onClick={() =>*/}
      {/*        navigate(LOGIN_ROUTE, {*/}
      {/*          state: { from: location.pathname },*/}
      {/*        })*/}
      {/*      }*/}
      {/*    >*/}
      {/*      {t('common.toLogin')}*/}
      {/*    </Button>*/}
      {/*    <div className="mb-9 mt-12 flex items-center">*/}
      {/*      <hr className="flex-grow border-t border-gray-300" />*/}
      {/*      <span className="mx-4">{t('conferences.orContinueWithoutAccount')}</span>*/}
      {/*      <hr className="flex-grow border-t border-gray-300" />*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*)}*/}
      <PublicLoginButton />
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
                  value={atob(storedPasswordsByMeetingIds[meetingId] || '')}
                  placeholder={t('conferences.passwordOfConference')}
                  rules={{
                    required: t('common.min_chars', { count: 1 }),
                  }}
                  variant="dialog"
                />
              </div>
            )}
            <PublicJoinButton />
          </form>
        </Form>
      )}
    </div>
  );
};

export default PublicConferenceJoinForm;
