import crypto from 'crypto';
import fs from 'fs';
import { z } from 'zod';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, HttpStatus } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import LicenseErrorMessages from '@libs/license/license-error-messages';
import LicenseDto from '@libs/license/types/license.dto';
import PostChallengeAnswerDto from '@libs/license/types/postChallengeAnswer.dto';
import { License, LicenseDocument } from '../licenses/license.schema';

@Injectable()
class LicenseServerService {
  /**
   * The public key used to validate signatures of licenses.
   */
  private readonly serverPrivateKey;

  private readonly serverPublicKey;

  /**
   * The schema used to determine whether a value is a valid license object.
   */
  private readonly licenseObjectSchema: z.Schema;

  constructor(@InjectModel(License.name) private licenseModel: Model<LicenseDocument>) {
    this.serverPrivateKey = fs.readFileSync('server_private_key.pem', 'utf8');
    this.serverPublicKey = fs.readFileSync('server_public_key.pem', 'utf8');

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

  createChallenge() {
    const challenge = crypto.randomBytes(32).toString('hex');
    return crypto.publicEncrypt(this.serverPublicKey, Buffer.from(challenge)).toString('base64');
  }

  verifyChallengeAnswer(postChallengeAnswerDto: PostChallengeAnswerDto) {
    const { encryptedResponse, challenge } = postChallengeAnswerDto;
    const decryptedResponse = crypto
      .privateDecrypt(this.serverPrivateKey, Buffer.from(encryptedResponse, 'base64'))
      .toString('utf8');
    return decryptedResponse === challenge;
  }

  createSignature(licenseData: string) {
    const sign = crypto.createSign('SHA256');
    sign.update(licenseData).end();

    return sign.sign(this.serverPrivateKey, 'base64');
  }

  async addLicense(addLicenseDto: LicenseDto) {
    if (!this.isLicenseObject(addLicenseDto)) {
      throw new CustomHttpException(LicenseErrorMessages.NotALicenseError, HttpStatus.BAD_REQUEST);
    }

    try {
      await this.licenseModel.create(addLicenseDto);
    } catch (error) {
      throw new CustomHttpException(
        LicenseErrorMessages.NotAbleToAddLicenseError,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }
}

export default LicenseServerService;
