import mongoose from 'mongoose';

type CreateLicenseDto = {
  readonly _id: mongoose.Types.ObjectId;

  id: mongoose.Types.ObjectId;

  clientPublicKey: string;

  signature: string;

  userId: string;

  platformFrontendUrl: string;

  platformOwnerAddress: string;

  validFromUtc: Date;

  validToUtc: Date;
};

export default LicenseDto;
