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
import type TokenPayload from '@libs/license/types/token-payload';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import LICENSE_ENDPOINT from '@libs/license/constants/license-endpoints';
import LICENSE_SERVER_URL from '@libs/license/constants/licenseServerUrl';
import LicenseErrorMessages from '@libs/license/constants/licenseErrorMessages';
import LICENSE_CHECK_INTERVAL from '@libs/license/constants/licenseCheckInterval';
import CustomHttpException from '../common/CustomHttpException';
import { License, LicenseDocument } from './license.schema';
import SafeOnModuleInit from '../common/decorators/safeOnModuleInit.decorator';

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

  @SafeOnModuleInit()
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
        licenseId: '',
        numberOfUsers: 0,
        licenseKey: '',
        token: '',
        validFromUtc: '',
        validToUtc: '',
        isLicenseActive: false,
      });

      await defaultLicense.save();
    }

    await this.checkLicenseValidity();
  }

  @Interval(LICENSE_CHECK_INTERVAL)
  async checkLicenseValidity() {
    const licenseInfo = await this.licenseModel.findOne<LicenseInfoDto>({}, 'licenseKey token isLicenseActive').lean();

    if (licenseInfo?.isLicenseActive && licenseInfo?.token) {
      try {
        Logger.log('Checking license validity...', LicenseService.name);
        await this.verifyToken(licenseInfo);
      } catch (error) {
        Logger.error('License check failed', LicenseService.name);
      }
    }
  }

  async invalidateLicenseCache(): Promise<void> {
    await this.cacheManager.del(`/${EDU_API_ROOT}/${LICENSE_ENDPOINT}`);
  }

  async getLicenseDetails() {
    let licenseInfo: LicenseInfoDto | null;
    try {
      licenseInfo = await this.licenseModel
        .findOne<LicenseInfoDto>({}, 'customerId licenseId isLicenseActive numberOfUsers validFromUtc validToUtc')
        .lean();
      return licenseInfo;
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DB_ACCESS_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async setIsLicenseActive(isLicenseActive: boolean) {
    try {
      await this.licenseModel.updateOne<LicenseInfoDto>({}, { $set: { isLicenseActive } }).lean();
      await this.invalidateLicenseCache();
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DB_ACCESS_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async signLicense(signLicenseDto: SignLicenseDto) {
    try {
      Logger.log('Signing license...', LicenseService.name);
      const { data: token } = await this.licenseServerApi.post<string>('sign', signLicenseDto);

      if (!token) {
        throw new CustomHttpException(
          LicenseErrorMessages.LICENSE_SIGNING_FAILED,
          HttpStatus.NOT_FOUND,
          undefined,
          LicenseService.name,
        );
      }

      const tokenInfo = this.jwtService.decode<TokenPayload>(token);

      const dbResponse = await this.licenseModel
        .updateOne<LicenseInfoDto>(
          {},
          {
            $set: {
              customerId: tokenInfo.customerId,
              licenseId: tokenInfo.licenseId,
              numberOfUsers: tokenInfo.numberOfUsers,
              licenseKey: signLicenseDto.licenseKey,
              token,
              validFromUtc: tokenInfo.validFromUtc * 1000,
              validToUtc: tokenInfo.validToUtc * 1000,
              isLicenseActive: true,
            },
          },
          { upsert: true },
        )
        .lean();

      if (!dbResponse) {
        throw new CustomHttpException(
          CommonErrorMessages.DB_ACCESS_FAILED,
          HttpStatus.INTERNAL_SERVER_ERROR,
          undefined,
          LicenseService.name,
        );
      }

      Logger.log('License signed', LicenseService.name);

      await this.invalidateLicenseCache();

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

  async verifyToken(licenseInfo: LicenseInfoDto) {
    const { token, licenseKey } = licenseInfo;

    try {
      const { status } = await this.licenseServerApi.post<TokenPayload>(
        'verify',
        { token },
        { validateStatus: (valStatus) => valStatus < 500 },
      );

      const isLicenseActive = status === 200 || status === 205;
      if (isLicenseActive) {
        Logger.log('License is active', LicenseService.name);
      }

      await this.setIsLicenseActive(isLicenseActive);

      if (licenseKey && status === 205) {
        Logger.log('License was updated. Resigning...', LicenseService.name);
        await this.signLicense({ licenseKey });
      }
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
