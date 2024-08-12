import mongoose from 'mongoose';

interface LicenseInfoDto {
  id?: mongoose.Types.ObjectId;
  licenseKey: string;
  validFromUtc: Date;
  validToUtc: Date;
  isLicenseActive: boolean;
}

export default LicenseInfoDto;
