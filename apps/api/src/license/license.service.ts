import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import LicenseInfoDto from '@libs/license/types/license-info.dto';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import LICENSE_ENDPOINT from '@libs/license/constants/license-endpoints';
import { License, LicenseDocument } from './license.schema';

@Injectable()
class LicenseService implements OnModuleInit {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(License.name) private licenseModel: Model<LicenseDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
}

export default LicenseService;
