import mongoose from 'mongoose';

interface RemoveLicenseDto {
  licenseIds: mongoose.Types.ObjectId[];
  signature: string;
  userId: string;
  publicKey: string;
}

export default RemoveLicenseDto;
