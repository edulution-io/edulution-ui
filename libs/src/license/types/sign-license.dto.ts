import { IsString } from 'class-validator';

class SignLicenseDto {
  @IsString()
  licenseKey: string;
}

export default SignLicenseDto;
