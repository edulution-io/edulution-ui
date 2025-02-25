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
import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Interval } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import axios, { AxiosInstance } from 'axios';
import type LicenseInfoDto from '@libs/license/types/license-info.dto';
import type SignLicenseDto from '@libs/license/types/sign-license.dto';
import type LicenseJwt from '@libs/license/types/license-jwt';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import LICENSE_ENDPOINT from '@libs/license/constants/license-endpoints';
import LICENSE_SERVER_URL from '@libs/license/constants/licenseServerUrl';
import LicenseErrorMessages from '@libs/license/constants/licenseErrorMessages';
import LICENSE_CHECK_INTERVAL from '@libs/license/constants/licenseCheckInterval';
import { License, LicenseDocument } from './license.schema';

@Injectable()
class LicenseService implements OnModuleInit {
  private licenseServerApi: AxiosInstance;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(License.name) private licenseModel: Model<LicenseDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,

    private jwtService: JwtService,
  ) {
    this.licenseServerApi = axios.create({
      baseURL: LICENSE_SERVER_URL,
    });
  }

  async onModuleInit() {
    const collections = await this.connection.db?.listCollections({ name: 'licenses' }).toArray();

    if (collections?.length === 0) {
      await this.connection.db?.createCollection('licenses');
    }

    const count = await this.licenseModel.countDocuments();

    if (count === 0) {
      // eslint-disable-next-line new-cap
      const defaultLicense = new this.licenseModel({
        customerId: '',
        hostname: '',
        numberOfUsers: 0,
        licenseKey: '',
        token: '',
        validFromUtc: '',
        validToUtc: '',
        isLicenseActive: false,
      });

      await defaultLicense.save();
    }
  }

  @Interval(LICENSE_CHECK_INTERVAL)
  async checkLicenseValidity() {
    Logger.log('Checking license validity...', LicenseService.name);
    await this.verifyToken();
  }

  async invalidateCache(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async getLicenseDetails() {
    let licenseInfo: LicenseInfoDto | null;
    try {
      licenseInfo = await this.licenseModel
        .findOne<LicenseInfoDto>({}, 'customerId hostname isLicenseActive numberOfUsers validFromUtc validToUtc')
        .lean();
      return licenseInfo;
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateLicense(isLicenseActive: boolean) {
    try {
      await this.licenseModel.updateOne<LicenseInfoDto>({}, { $set: { isLicenseActive } }).lean();
      await this.invalidateCache(`/${EDU_API_ROOT}/${LICENSE_ENDPOINT}`);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async signLicense(signLicenseDto: SignLicenseDto) {
    try {
      const { data: token } = await this.licenseServerApi.post<string>('sign', signLicenseDto);

      if (!token) {
        throw new CustomHttpException(
          LicenseErrorMessages.LICENSE_SIGNING_FAILED,
          HttpStatus.NOT_FOUND,
          undefined,
          LicenseService.name,
        );
      }

      const tokenInfo = this.jwtService.decode<LicenseJwt>(token);

      const dbResponse = await this.licenseModel
        .updateOne<LicenseInfoDto>(
          {},
          {
            $set: {
              customerId: tokenInfo.customerId,
              hostname: tokenInfo.hostname,
              numberOfUsers: tokenInfo.numberOfUsers,
              licenseKey: signLicenseDto.licenseKey,
              token,
              validFromUtc: tokenInfo.iat * 1000,
              validToUtc: tokenInfo.exp * 1000,
              isLicenseActive: true,
            },
          },
        )
        .lean();

      if (!dbResponse) {
        throw new CustomHttpException(
          CommonErrorMessages.DBAccessFailed,
          HttpStatus.INTERNAL_SERVER_ERROR,
          undefined,
          LicenseService.name,
        );
      }

      const license = await this.getLicenseDetails();

      return license;
    } catch (error) {
      throw new CustomHttpException(
        LicenseErrorMessages.LICENSE_SIGNING_FAILED,
        HttpStatus.NOT_FOUND,
        undefined,
        LicenseService.name,
      );
    }
  }

  async verifyToken() {
    try {
      const licenseInfo = await this.licenseModel.findOne<LicenseInfoDto>({}, 'token').lean();

      if (!licenseInfo) {
        throw new CustomHttpException(
          CommonErrorMessages.DBAccessFailed,
          HttpStatus.INTERNAL_SERVER_ERROR,
          undefined,
          LicenseService.name,
        );
      }

      const { token } = licenseInfo;

      const response = await this.licenseServerApi.post<LicenseJwt>(
        'verify',
        { token },
        {
          validateStatus: (status) => status < 500,
        },
      );
      let isLicenseActive = false;

      if (response.status === 200) {
        isLicenseActive = true;
        Logger.log('License is active', LicenseService.name);
      }

      await this.updateLicense(isLicenseActive);
    } catch (error) {
      throw new CustomHttpException(
        LicenseErrorMessages.LICENSE_VERIFICATION_FAILED,
        HttpStatus.NOT_FOUND,
        undefined,
        LicenseService.name,
      );
    }
  }
}

export default LicenseService;
