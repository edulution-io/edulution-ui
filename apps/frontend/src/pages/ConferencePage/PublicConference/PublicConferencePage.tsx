import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import usePublicConferenceStore from '@/pages/ConferencePage/PublicConference/PublicConferenceStore';
import useUserStore from '@/store/UserStore/UserStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import { useForm } from 'react-hook-form';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import { CONFERENCES_PUBLIC_SSE_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import PublicConferenceJoinForm from '@/pages/ConferencePage/PublicConference/PublicConferenceJoinForm';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';

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
    await updatePublicConference();
    if (!meetingId || !publicConference?.isRunning) return;

    setWaitingForConferenceToStart(false);

    const { name, password } = form.getValues();
    setPublicUserFullName(name);
    setStoredPasswordByMeetingId(meetingId, password);
    if (user?.username) {
      void joinConferenceAsRegisteredUser(meetingId, password);
    } else {
      void getJoinConferenceUrl(name, meetingId, password);
    }
  };

  useEffect(() => {
    if (publicConference) {
      const eventSource = new EventSource(
        `/${EDU_API_ROOT}/${CONFERENCES_PUBLIC_SSE_EDU_API_ENDPOINT}?meetingID=${publicConference.meetingID}`,
      );

      const updateConferenceHandler = (e: MessageEvent<string>) => {
        const { type, data } = e;
        if (meetingId === data && type === SSE_MESSAGE_TYPE.STARTED) {
          void joinConference();
        } else if (meetingId === data && type === SSE_MESSAGE_TYPE.STOPPED) {
          setJoinConferenceUrl('');
          setWaitingForConferenceToStart(true);
        }
      };

      eventSource.addEventListener(SSE_MESSAGE_TYPE.STARTED, updateConferenceHandler);
      eventSource.addEventListener(SSE_MESSAGE_TYPE.STOPPED, updateConferenceHandler);

      return () => {
        eventSource.removeEventListener(SSE_MESSAGE_TYPE.STARTED, updateConferenceHandler);
        eventSource.removeEventListener(SSE_MESSAGE_TYPE.STOPPED, updateConferenceHandler);
        eventSource.close();
      };
    }

    return undefined;
  }, [publicConference]);

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
    return <LoadingIndicator isOpen />;
  }

  if (!publicConference?.isPublic || !meetingId) {
    return (
      <div className="mx-auto w-[90%] md:w-[400px]">
        <div className="text-lg">{t('conferences.isNotPublicOrDoesNotExist')}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-[90%] md:w-[400px]">
      <div>{t('conferences.publicConference')}</div>
      <h3 className="mt-3">{publicConference.name}</h3>
      <div className="mb-8">
        {t('common.from')} {publicConference.creator?.firstName} {publicConference.creator?.lastName}
      </div>
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
    </div>
  );
};

export default PublicConferencePage;
