import SendPushNotificationDto from '@libs/notification/types/send-pushNotification.dto';

interface NotificationJobData {
  usernames: string[];
  notification: Omit<SendPushNotificationDto, 'to'> & { translate?: boolean };
}

export default NotificationJobData;
