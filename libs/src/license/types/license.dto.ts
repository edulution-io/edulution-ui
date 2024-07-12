import mongoose from 'mongoose';

type LicenseDto = {
  readonly _id: mongoose.Types.ObjectId;

  id: mongoose.Types.ObjectId;

  signature: string;

  userId: string;

  platformFrontendUrl: string;

  platformOwnerAddress: string;

  validFromUtc: Date;

  validToUtc: Date;
};

export default LicenseDto;
