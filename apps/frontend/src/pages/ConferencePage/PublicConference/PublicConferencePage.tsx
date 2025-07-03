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

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import usePublicConferenceStore from '@/pages/ConferencePage/PublicConference/usePublicConferenceStore';
import useUserStore from '@/store/UserStore/useUserStore';
import useConferenceStore from '@/pages/ConferencePage/useConferenceStore';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/useConferenceDetailsDialogStore';
import { useForm } from 'react-hook-form';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import { CONFERENCES_PUBLIC_SSE_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import PublicConferenceJoinForm from '@/pages/ConferencePage/PublicConference/PublicConferenceJoinForm';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import delay from '@libs/common/utils/delay';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import PageLayout from '@/components/structure/layout/PageLayout';

const PublicConferencePage = (): React.ReactNode => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const {
    joinConference: joinConferenceAsRegisteredUser,
    joinConferenceUrl,
    setJoinConferenceUrl,
    isLoading: isJoinConferenceLoading,
  } = useConferenceDetailsDialogStore();
  const { isLoading: isGetConferencesLoading, getConferences, conferences } = useConferenceStore();
  const {
    getJoinConferenceUrl,
    isGetJoinConferenceUrlLoading,
    setStoredPasswordByMeetingId,
    setPublicUserFullName,
    getPublicConference,
    isGetPublicConferenceLoading,
  } = usePublicConferenceStore();
  const { meetingId } = useParams();
  const form = useForm<{ name: string; password: string }>();
  const [isWaitingForConferenceToStart, setWaitingForConferenceToStart] = useState(false);
  const [isJoiningConference, setIsJoiningConference] = useState(false);
  const [publicConference, setPublicConference] = useState<Partial<ConferenceDto> | null>(null);

  const isInvitedUser = !!conferences.find((c) => c.meetingID === meetingId);

  const updatePublicConference = async () => {
    const currentPublicConference = await getPublicConference(meetingId);
    setPublicConference(currentPublicConference);
    return currentPublicConference;
  };

  useEffect(() => {
    if (!meetingId) return;

    if (user?.username) {
      void getConferences();
    }
    void updatePublicConference();
  }, [meetingId]);

  const joinConference = async () => {
    setIsJoiningConference(true);
    await delay(3000);
    const publicConferenceResponse = await updatePublicConference();
    if (!meetingId || !publicConferenceResponse?.isRunning) {
      setIsJoiningConference(false);
      return;
    }

    setWaitingForConferenceToStart(false);

    const { name, password } = form.getValues();
    setPublicUserFullName(name);
    setStoredPasswordByMeetingId(meetingId, password);
    if (user?.username) {
      void joinConferenceAsRegisteredUser(meetingId, password);
    } else {
      void getJoinConferenceUrl(name, meetingId, password);
    }
    setIsJoiningConference(false);
  };

  useEffect(() => {
    if (publicConference?.meetingID) {
      const eventSource = new EventSource(
        `/${EDU_API_ROOT}/${CONFERENCES_PUBLIC_SSE_EDU_API_ENDPOINT}?meetingID=${publicConference.meetingID}`,
      );

      const controller = new AbortController();
      const { signal } = controller;

      const updateConferenceHandler = (e: MessageEvent<string>) => {
        const { type, data } = e;
        if (meetingId === data && type === SSE_MESSAGE_TYPE.CONFERENCE_STARTED) {
          void joinConference();
        } else if (meetingId === data && type === SSE_MESSAGE_TYPE.CONFERENCE_STOPPED) {
          setJoinConferenceUrl('');
          setWaitingForConferenceToStart(true);
        }
      };

      eventSource.addEventListener(SSE_MESSAGE_TYPE.CONFERENCE_STARTED, updateConferenceHandler, { signal });
      eventSource.addEventListener(SSE_MESSAGE_TYPE.CONFERENCE_STOPPED, updateConferenceHandler, { signal });

      return () => {
        controller.abort();
        eventSource.close();
      };
    }

    return undefined;
  }, [publicConference?.meetingID]);

  const automaticallyJoinAsRegisteredUser = async () => {
    if (
      isGetConferencesLoading ||
      isJoinConferenceLoading ||
      !user ||
      !meetingId ||
      !publicConference ||
      joinConferenceUrl ||
      isWaitingForConferenceToStart ||
      (!isInvitedUser && publicConference.password)
    ) {
      return;
    }

    if (publicConference?.isRunning) {
      setWaitingForConferenceToStart(false);
      const { password } = form.getValues();
      setStoredPasswordByMeetingId(meetingId, password);
      await joinConferenceAsRegisteredUser(meetingId, password);
    } else {
      setWaitingForConferenceToStart(true);
    }
  };

  useEffect(() => {
    void automaticallyJoinAsRegisteredUser();
  }, [user?.username, meetingId, publicConference, conferences, isWaitingForConferenceToStart]);

  if (isGetConferencesLoading || isGetJoinConferenceUrlLoading || isGetPublicConferenceLoading) {
    return <LoadingIndicatorDialog isOpen />;
  }

  if (!publicConference?.isPublic || !meetingId) {
    return (
      <div className="mx-auto w-[90%] md:w-[400px]">
        <div className="text-lg">{t('conferences.isNotPublicOrDoesNotExist')}</div>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="mx-auto w-[90%] md:w-[400px]">
        <div>{t('conferences.publicConference')}</div>
        <h3 className="mt-3">{publicConference.name}</h3>
        <div className="mb-8">
          {t('common.from')} {publicConference.creator?.firstName} {publicConference.creator?.lastName}
        </div>
        {isJoiningConference ? (
          <CircleLoader />
        ) : (
          <PublicConferenceJoinForm
            meetingId={meetingId}
            isPermittedUser={isInvitedUser || !publicConference.password}
            form={form}
            joinConference={joinConference}
            isWaitingForConferenceToStart={isWaitingForConferenceToStart}
            setWaitingForConferenceToStart={setWaitingForConferenceToStart}
            publicConference={publicConference}
            updatePublicConference={updatePublicConference}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default PublicConferencePage;
