interface LicenseInfoDto {
  licenseKey: string;
  validFromUtc: Date;
  validToUtc: Date;
  isLicenseActive: boolean;
}

export default LicenseInfoDto;
