import { AppExtention } from '@libs/appconfig/constants/appExtention';
import { appExtendedOptions_OnlyOffice } from '@libs/appconfig/constants/appConfig-OnlyOffice';
import { appExtendedOptions_ImapFeed } from '@libs/appconfig/constants/appConfig-IMAP';

export const appExtendedOptions: AppExtention = {
  ONLY_OFFICE: appExtendedOptions_OnlyOffice,
  MAIL: appExtendedOptions_ImapFeed,
};
