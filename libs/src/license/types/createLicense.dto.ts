import mongoose from 'mongoose';

interface CreateLicenseDto {
  id: mongoose.Types.ObjectId;
  publicKey: string;
  signature: string;
  userId: string;
  platformOrganizationName: string;
  platformFrontendUrl: string;
  platformOwnerAddressPLZ: string;
  platformOwnerAddressCity: string;
  platformOwnerAddressStreet: string;
  platformOwnerAddressStreetNumber: string;
  validFromUtc: Date;
  validToUtc: Date;
}

export default CreateLicenseDto;
