import { Controller, Body, Post, HttpStatus } from '@nestjs/common';
import CreateLicenseDto from '@libs/license/types/createLicense.dto';
import LicenseErrorMessages from '@libs/license/license-error-messages';
import CustomHttpException from '@libs/error/CustomHttpException';
import PostChallengeAnswerDto from '@libs/license/types/postChallengeAnswer.dto';
import { LICENSE_ENDPOINT } from '@libs/license/types/license-endpoints';
import LicenseServerService from './licenseServer.service';

@Controller(LICENSE_ENDPOINT)
class LicenseServerController {
  constructor(private readonly licenseServerService: LicenseServerService) {}

  @Post('/generate-license')
  async addLicense(@Body() createLicenseDto: CreateLicenseDto) {
    if (!this.licenseServerService.isLicenseObject(createLicenseDto)) {
      throw new CustomHttpException(LicenseErrorMessages.NotALicenseError, HttpStatus.BAD_REQUEST);
    }

    const signature = await this.licenseServerService.createSignature(JSON.stringify(createLicenseDto));
    const license = { ...createLicenseDto, signature, userId: createLicenseDto.userId };

    try {
      await this.licenseServerService.addLicense(license);
    } catch (error) {
      throw new CustomHttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return license;
  }

  @Post('/challenge')
  async getChallenge() {
    const encryptedChallenge = await this.licenseServerService.createChallenge();

    return { challenge: encryptedChallenge };
  }

  @Post('/verify')
  async postChallengeAnswer(@Body() postChallengeAnswerDto: PostChallengeAnswerDto) {
    const decryptedResponse = await this.licenseServerService.verifyChallengeAnswer(postChallengeAnswerDto);

    return { isValid: decryptedResponse };
  }
}

export default LicenseServerController;
