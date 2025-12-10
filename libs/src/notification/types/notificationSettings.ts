import TApps from '@libs/appconfig/types/appsType';

interface NotificationSettings {
  pushEnabled: boolean;
  modulePreferences: Partial<Record<TApps, boolean>>;
}

export default NotificationSettings;
