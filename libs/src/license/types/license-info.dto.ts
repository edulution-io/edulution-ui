interface LicenseInfoDto {
  licenseKey: string;
  token: string;
  validFromUtc: Date;
  validToUtc: Date;
  isLicenseActive: boolean;
}

export default LicenseInfoDto;
