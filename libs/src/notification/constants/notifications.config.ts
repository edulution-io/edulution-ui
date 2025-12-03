import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';

const notificationsConfig = {
  conference: {
    started: (name: string, meetingID: string) => ({
      title: `Conference started: ${name}`,
      body: `The conference "${name}" has started.`,
      translate: true,
      data: {
        meetingID,
        type: 'conference_started' as const,
      },
    }),
  },
  bulletin: {
    ready: (title: string, bulletinId: string) => ({
      title: `Bulletin ready: ${title}`,
      body: `The bulletin "${title}" is now available.`,
      translate: true,
      data: {
        bulletinId,
        type: SSE_MESSAGE_TYPE.BULLETIN_UPDATED,
      },
    }),
  },
  survey: {
    created: (title: string, surveyId: string) => ({
      title: `Survey created: ${title}`,
      body: `The survey "${title}" has just been created.`,
      translate: true,
      data: {
        surveyId,
        type: SSE_MESSAGE_TYPE.SURVEY_CREATED,
      },
    }),
    updated: (title: string, surveyId: string) => ({
      title: `Survey updated: ${title}`,
      body: `The survey "${title}" has just been updated.`,
      translate: true,
      data: {
        surveyId,
        type: SSE_MESSAGE_TYPE.SURVEY_UPDATED,
      },
    }),
  },
};

export default notificationsConfig;
