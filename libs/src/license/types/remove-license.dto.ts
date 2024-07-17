import mongoose from 'mongoose';

type RemoveLicenseDto = {
  licenseIds: mongoose.Types.ObjectId[];

  signature: string;

  userId: string;

  publicKey: string;
};

export default RemoveLicenseDto;
