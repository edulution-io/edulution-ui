import mongoose from 'mongoose';

interface LicenseInfoDto {
  id: mongoose.Types.ObjectId;
  validFromUtc: Date;
  validToUtc: Date;
  isLicenseActive: boolean;
}

export default LicenseInfoDto;
