export interface GenerateLicenseDto {
  schemaVersion: number;
  platformOrganizationName: string;
  platformFrontendUrl: string;
  platformOwnerAddressPLZ: string;
  platformOwnerAddressCity: string;
  platformOwnerAddressStreet: string;
  platformOwnerAddressStreetNumber: string;
  platformUser: string;
  validFromUtc: Date;
  validToUtc: Date;
}
