import mongoose from 'mongoose';

interface LicenseDto {
  id: mongoose.Types.ObjectId;
  userId: string;
  signature: string;
  publicKey: string;
  platformOrganizationName: string;
  platformFrontendUrl: string;
  platformOwnerAddressPLZ: string;
  platformOwnerAddressCity: string;
  platformOwnerAddressStreet: string;
  platformOwnerAddressStreetNumber: string;
  validFromUtc: Date;
  validToUtc: Date;
}

export default LicenseDto;
