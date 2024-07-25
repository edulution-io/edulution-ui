import crypto from 'crypto';
import { z } from 'zod';
import { sort } from 'fast-sort';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, HttpStatus } from '@nestjs/common';
import LicenseDto from '@libs/license/types/license.dto';
import LicenseErrorMessages from '@libs/license/license-error-messages';
import CustomHttpException from '@libs/error/CustomHttpException';
import LicenseInfoDto from '@libs/license/types/license-info.dto';
import { License, LicenseDocument } from './license.schema';
import { mockedLicenses } from './license.mock';
import licenseValidationPublicKeyPEM from './licenseValidationPublicKeyPEM';

@Injectable()
class LicenseService {
  /**
   * The public key used to validate signatures of licenses.
   */
  // private readonly licenseValidationPublicKey?: crypto.KeyObject;
  private readonly licenseValidationPublicKey?: crypto.KeyPairSyncResult<string, string>;

  /**
   * The schema used to determine whether a value is a valid license object.
   */
  private readonly licenseObjectSchema: z.Schema;

  constructor(@InjectModel(License.name) private licenseModel: Model<LicenseDocument>) {
    this.licenseValidationPublicKey = licenseValidationPublicKeyPEM
      ? // ? crypto.createPublicKey({
        //   key: licenseValidationPublicKeyPEM,
        //   type: 'pkcs1',
        //   format: 'pem',
        // })
        crypto.generateKeyPairSync('rsa', {
          modulusLength: 2048,
          privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
          publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
        })
      : undefined;

    this.licenseObjectSchema = z.object({
      platformFrontendUrl: z.string(),
      platformOwnerAddress: z.string(),
      validFromUtc: z.object({ date: z.date(), time: z.string() }),
      validToUtc: z.object({ date: z.date(), time: z.string() }),
      signature: z.string(),
    });
  }

  /**
   * Determines whether the specified value is a {@link License} object,
   * meaning it is an object that has all the mandatory properties of the license class.
   *
   * @param value The value to check.
   * @returns True if the specified value is a license object; otherwise, false.
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public isLicenseObject = (value: unknown): boolean => this.licenseObjectSchema.parse(value).error === undefined;

  /**
   * Adds the specified license to the platform.
   *
   * @param license The license to add.
   * @returns A promise for the asynchronous operation.
   * @throws LicenseValidationPublicKeyMissingError The license validation public key is missing.
   * @throws InvalidLicenseSignatureError The signature of the specified license is invalid.
   * @throws MismatchingLicensePlatformFrontendUrlError The platform frontend URL of the specified license
   * does not match the frontend URL of the platform.
   * @throws LicenseAlreadyAddedError The specified license has already been added.
   */
  public addLicense = async (license: LicenseDto): Promise<void> => {
    if (!this.licenseValidationPublicKey) {
      throw new CustomHttpException(
        LicenseErrorMessages.LicenseValidationPublicKeyMissingError,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const newLicense = {
      _id: license.id,
      ...license,
    };

    if (!this.verifyLicenseSignature(newLicense)) {
      throw new CustomHttpException(LicenseErrorMessages.InvalidLicenseSignatureError, HttpStatus.BAD_REQUEST);
    }

    await this.licenseModel.findOne({ signature: newLicense.signature }).then(async (existingLicense) => {
      if (existingLicense) {
        throw new CustomHttpException(LicenseErrorMessages.LicenseAlreadyAddedError, HttpStatus.BAD_REQUEST);
      }
      return this.licenseModel.create(newLicense);
    });
  };

  public removeLicenses = async (licenseIds: mongoose.Types.ObjectId[]): Promise<void> => {
    await this.licenseModel.deleteMany({ _id: { $in: licenseIds } });
  };

  /**
   * Verifies the signature of the specified license.
   *
   * @param license The license to verify the signature of.
   * @returns True if the signature of the specified license is valid; otherwise, false.
   */
  public verifyLicenseSignature = (license: License): boolean => {
    const { signature, ...licenseWithoutSignature } = license;

    const licenseWithoutSignatureJson = JSON.stringify(licenseWithoutSignature, null, 2);

    return this.verifySignature(licenseWithoutSignatureJson, signature);
  };

  /**
   * Verifies the specified signature for the specified data.
   *
   * @param data The data to verify.
   * @param signature The signature to verify.
   * @returns True if the specified signature is valid for the specified data; otherwise, false.
   */
  public verifySignature = (data: string, signature: string): boolean =>
    this.licenseValidationPublicKey?.publicKey
      ? crypto.verify(
          'SHA256',
          Buffer.from(data),
          this.licenseValidationPublicKey?.publicKey,
          Buffer.from(signature, 'base64'),
        )
      : false;

  /**
   * Gets details about all licenses of the platform.
   *
   * @returns A list with details of all licenses of the platform.
   */
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
