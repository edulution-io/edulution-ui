import ANNOUNCEMENT_STATUS from '@libs/notification-center/constants/announcementStatus';

export type AnnouncementStatusType = (typeof ANNOUNCEMENT_STATUS)[keyof typeof ANNOUNCEMENT_STATUS];
