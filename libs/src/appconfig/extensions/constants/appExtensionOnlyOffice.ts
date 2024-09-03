import FileSharingAppExtensions from '@libs/appconfig/extensions/types/file-sharing-app-extension-enum';

const appExtensionOnlyOffice = [
  {
    name: FileSharingAppExtensions.ONLY_OFFICE_URL,
    title: 'appExtendedOptions.onlyOffice.onlyOfficeUrlTitle',
    description: 'appExtendedOptions.onlyOffice.onlyOfficeUrl',
    type: 'input',
    value: '',
  },
  {
    name: FileSharingAppExtensions.ONLY_OFFICE_JWT_SECRET,
    title: 'appExtendedOptions.onlyOffice.onlyOfficeJwtSecretTitle',
    description: 'appExtendedOptions.onlyOffice.onlyOfficeJwtSecretDescription',
    type: 'input',
    value: '',
  },
];

export default appExtensionOnlyOffice;
