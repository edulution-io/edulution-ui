import mongoose from 'mongoose';

interface LicenseDto {
  id: mongoose.Types.ObjectId;
  signature: string;
  userId: string;
  platformFrontendUrl: string;
  platformOwnerAddress: string;
  validFromUtc: Date;
  validToUtc: Date;
  publicKey: string;
}

export default LicenseDto;
