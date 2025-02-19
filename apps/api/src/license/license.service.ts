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

import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import LicenseInfoDto from '@libs/license/types/license-info.dto';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import { License, LicenseDocument } from './license.schema';

@Injectable()
class LicenseService implements OnModuleInit {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(License.name) private licenseModel: Model<LicenseDocument>,
  ) {}

  async onModuleInit() {
    const collections = await this.connection.db?.listCollections({ name: 'licenses' }).toArray();

    if (collections?.length === 0) {
      await this.connection.db?.createCollection('licenses');
    }

    const count = await this.licenseModel.countDocuments();

    if (count === 0) {
      // eslint-disable-next-line new-cap
      const defaultLicense = new this.licenseModel({
        licenseKey: '',
        validFromUtc: '',
        validToUtc: '',
        isLicenseActive: false,
      });

      await defaultLicense.save();
    }
  }

  async getLicenseDetails() {
    let licenseInfo: LicenseInfoDto | null;
    try {
      licenseInfo = await this.licenseModel.findOne<LicenseInfoDto>();
      return licenseInfo;
    } catch (e) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export default LicenseService;
