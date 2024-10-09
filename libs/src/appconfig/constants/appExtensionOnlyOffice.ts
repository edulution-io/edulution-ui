import FileSharingAppExtensions from '@libs/appconfig/constants/file-sharing-app-extension';
import AppConfigExtendedOptions from '@libs/appconfig/types/appConfigExtendedOptions';

const appExtensionOnlyOffice: AppConfigExtendedOptions = {
  name: 'ONLY_OFFICE',
  options: [
    {
      name: FileSharingAppExtensions.ONLY_OFFICE_URL,
      width: 'full',
      type: 'text',
      value: '',
    },
    {
      name: FileSharingAppExtensions.ONLY_OFFICE_JWT_SECRET,
      width: 'full',
      type: 'text',
      value: '',
    },
  ],
};

export default appExtensionOnlyOffice;
