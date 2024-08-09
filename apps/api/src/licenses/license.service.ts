/*
 *
 * Testing purpose
 * ----------------
 *   THE SECTION FOR THE ADMIN WHERE HE CAN ADD/BUY LICENSES OR REASSIGN THEM TO USERS
 * ----------------
 *
 * */
import { z } from 'zod';
import { sort } from 'fast-sort';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, HttpStatus } from '@nestjs/common';
import LicenseDto from '@libs/license/types/license.dto';
import LicenseErrorMessages from '@libs/license/constants/license-error-messages';
import CustomHttpException from '@libs/error/CustomHttpException';
import LicenseInfoDto from '@libs/license/types/license-info.dto';
import { License, LicenseDocument } from './license.schema';
import { mockedLicenses } from './license.mock';

@Injectable()
class LicenseService {
  private readonly licenseObjectSchema: z.Schema;

  constructor(@InjectModel(License.name) private licenseModel: Model<LicenseDocument>) {
    this.licenseObjectSchema = z.object({
      platformFrontendUrl: z.string(),
      platformOwnerAddressPLZ: z.string(),
      platformOwnerAddressCity: z.string(),
      platformOwnerAddressStreet: z.string(),
      platformOwnerAddressStreetNumber: z.string(),
      validFromUtc: z.object({ date: z.date(), time: z.string() }),
      validToUtc: z.object({ date: z.date(), time: z.string() }),
      signature: z.string(),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public isLicenseObject = (value: unknown): boolean => this.licenseObjectSchema.parse(value).error === undefined;

  public addLicense = async (license: LicenseDto): Promise<void> => {
    const newLicense = {
      _id: license.id,
      ...license,
    };

    await this.licenseModel.findOne({ signature: newLicense.signature }).then(async (existingLicense) => {
      if (existingLicense) {
        throw new CustomHttpException(LicenseErrorMessages.AlreadyAdded, HttpStatus.BAD_REQUEST);
      }
      return this.licenseModel.create(newLicense);
    });
  };

  public removeLicenses = async (licenseIds: mongoose.Types.ObjectId[]): Promise<void> => {
    await this.licenseModel.deleteMany({ _id: { $in: licenseIds } });
  };

  public getLicensesDetails = async (username?: string) => {
    const now = new Date();
    let licenses: LicenseDto[] = [];
    if (username) {
      licenses = await this.licenseModel.find<LicenseDto>({ userId: { $eq: username } });
      if (!licenses || licenses.length === 0) {
        licenses = mockedLicenses.filter((license) => license.userId === username);
      }
    } else {
      licenses = await this.licenseModel.find<LicenseDto>({});
      if (!licenses || licenses.length === 0) {
        licenses = mockedLicenses;
      }
    }

    const licenseInfo: LicenseInfoDto[] = licenses.map((license: LicenseDto) => ({
      id: license.id,
      validFromUtc: license.validFromUtc,
      validToUtc: license.validToUtc,
      isLicenseActive: now >= license.validFromUtc && now <= license.validToUtc,
    }));

    return sort(licenseInfo).by([
      { desc: (license: LicenseInfoDto) => license.validFromUtc },
      { asc: (license: LicenseInfoDto) => license.validToUtc },
    ]);
  };
}

export default LicenseService;
