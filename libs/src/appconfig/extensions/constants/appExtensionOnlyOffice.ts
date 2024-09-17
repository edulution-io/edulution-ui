import FileSharingAppExtensions from '@libs/appconfig/extensions/types/file-sharing-app-extension';
import AppExtension from '@libs/appconfig/extensions/types/appExtension';

const appExtensionOnlyOffice: AppExtension = {
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
