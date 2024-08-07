import { Body, Controller, /*HttpStatus,*/ Post } from '@nestjs/common';
import CreateLicenseDto from '@libs/license/types/createLicense.dto';
// import LicenseErrorMessages from '@libs/license/license-error-messages';
// import CustomHttpException from '@libs/error/CustomHttpException';
// import PostChallengeAnswerDto from '@libs/license/types/postChallengeAnswer.dto';
import { LICENSE_SERVER_ENDPOINT } from '@libs/license/types/license-endpoints';
// import LicenseServerService from './licenseServer.service';
import LicenseServerService from './licenseServer.service';

@Controller(LICENSE_SERVER_ENDPOINT)
class LicenseServerController {
  constructor(private readonly licenseServerService: LicenseServerService) {}

  @Post('/generate-license')
  async addLicense(@Body() createLicenseDto: CreateLicenseDto) {
    // if (!this.licenseServerService.isLicenseObject(createLicenseDto)) {
    //   throw new CustomHttpException(LicenseErrorMessages.NotALicenseError, HttpStatus.BAD_REQUEST);
    // }
    //
    // const signature = this.licenseServerService.createSignature(JSON.stringify(createLicenseDto));
    // const license = { ...createLicenseDto, signature, userId: createLicenseDto.userId };
    //
    // await this.licenseServerService.addLicense(license);
    // return license;

    this.licenseServerService.addLicense(createLicenseDto);
  }

  // @Post('/challenge')
  // getChallenge() {
  //   const encryptedChallenge = this.licenseServerService.createChallenge();
  //   return { challenge: encryptedChallenge };
  // }
  //
  // @Post('/verify')
  // postChallengeAnswer(@Body() postChallengeAnswerDto: PostChallengeAnswerDto) {
  //   const decryptedResponse = this.licenseServerService.verifyChallengeAnswer(postChallengeAnswerDto);
  //   return { isValid: decryptedResponse };
  // }
}

export default LicenseServerController;
