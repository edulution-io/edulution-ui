import mongoose from 'mongoose';

interface CreateLicenseDto {
  id: mongoose.Types.ObjectId;
  publicKey: string;
  signature: string;
  userId: string;
  platformFrontendUrl: string;
  platformOwnerAddress: string;
  validFromUtc: Date;
  validToUtc: Date;
}

export default CreateLicenseDto;
