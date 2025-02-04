import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
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

  async invalidateCache(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async getLicenseDetails() {
    let licenseInfo: LicenseInfoDto | null;
    try {
      licenseInfo = await this.licenseModel.findOne<LicenseInfoDto>().lean();
      return licenseInfo;
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateLicense(licenseKey: string) {
    try {
      await this.licenseModel.updateOne<LicenseInfoDto>({}, { $set: { licenseKey, isLicenseActive: true } }).lean();

      await this.invalidateCache(`/${EDU_API_ROOT}/${LICENSE_ENDPOINT}`);

      const licenseInfo = await this.getLicenseDetails();
      return licenseInfo;
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
      const license = await this.getLicenseDetails();

      if (!license) {
        throw new CustomHttpException(
          CommonErrorMessages.DBAccessFailed,
          HttpStatus.INTERNAL_SERVER_ERROR,
          undefined,
          LicenseService.name,
        );
      }

      const { token } = license;

      const { data: licenseInfo } = await this.licenseServerApi.post<LicenseInfoDto>('verify', { token });
      return licenseInfo;
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
