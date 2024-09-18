import FileSharingAppExtensions from '@libs/appconfig/extensions/types/file-sharing-app-extension';
import AppConfigExtendedOptions from '@libs/appconfig/extensions/types/appConfigExtendedOptions';

const appExtensionOnlyOffice: AppConfigExtendedOptions = {
  name: 'ONLY_OFFICE',
  extensions: [
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
