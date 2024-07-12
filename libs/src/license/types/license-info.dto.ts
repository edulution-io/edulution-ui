import mongoose from 'mongoose';

type LicenseInfoDto = {
  id: mongoose.Types.ObjectId;

  validFromUtc: Date;

  validToUtc: Date;

  isLicenseActive: boolean;
};

export default LicenseInfoDto;
