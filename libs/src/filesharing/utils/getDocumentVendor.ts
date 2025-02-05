/*
* LICENSE
*
* This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
* the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

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
