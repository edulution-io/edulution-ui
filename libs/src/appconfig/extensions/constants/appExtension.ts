import AppExtension from '@libs/appconfig/extensions/types/appExtension';
import appExtensionOnlyOffice from '@libs/appconfig/extensions/constants/appExtensionOnlyOffice';
import appExtensionIMAP from '@libs/appconfig/extensions/constants/appExtensionIMAP';

const appExtension: AppExtension = {
  ONLY_OFFICE: appExtensionOnlyOffice,
  MAIL: appExtensionIMAP,
};

export default appExtension;
