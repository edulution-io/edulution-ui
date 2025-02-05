import getExtendedOptionValue from '@libs/appconfig/utils/getExtendedOptionValue';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import DocumentVendors from '@libs/filesharing/constants/documentVendors';
import { AppConfigDto } from '@libs/appconfig/types';

const getDocumentVendor = (appConfigs: AppConfigDto[]) => {
  const isOpenDocumentFormatEnabled = !!getExtendedOptionValue(
    appConfigs,
    APPS.FILE_SHARING,
    ExtendedOptionKeys.OVERRIDE_FILE_SHARING_DOCUMENT_VENDOR_MS_WITH_OO,
  );

  return isOpenDocumentFormatEnabled ? DocumentVendors.ODF : DocumentVendors.MSO;
};

export default getDocumentVendor;
