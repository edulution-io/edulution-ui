import mongoose from 'mongoose';
import LicenseDto from '@libs/license/types/license.dto';
import LicenseInfoDto from '@libs/license/types/license-info.dto';
import licenseValidationPublicKeyPEM from './licenseValidationPublicKeyPEM';

export const idLicense01 = new mongoose.Types.ObjectId(1);
export const idLicense02 = new mongoose.Types.ObjectId(2);
export const idLicense03 = new mongoose.Types.ObjectId(3);
export const idLicense04 = new mongoose.Types.ObjectId(4);
export const idLicense05 = new mongoose.Types.ObjectId(5);

export const license01: LicenseDto = {
  id: idLicense01,
  userId: 'agy-netzint-teacher',
  publicKey: licenseValidationPublicKeyPEM,
  signature: 'signature01',
  platformOrganizationName: 'platformOrganizationName01',
  platformFrontendUrl: 'platformFrontendUrl01',
  platformOwnerAddressPLZ: 'platformOwnerAddressPLZ01',
  platformOwnerAddressCity: 'platformOwnerAddressCity01',
  platformOwnerAddressStreet: 'platformOwnerAddressStreet01',
  platformOwnerAddressStreetNumber: 'platformOwnerAddressStreetNumber01',
  validFromUtc: new Date('2022-01-01T00:00:00Z'),
  validToUtc: new Date('2028-12-31T23:59:59Z'),
};
export const licenseInfo01: LicenseInfoDto = {
  id: license01.id,
  validFromUtc: license01.validFromUtc,
  validToUtc: license01.validToUtc,
  isLicenseActive: true,
};

export const license02: LicenseDto = {
  id: idLicense02,
  userId: 'agy-netzint1',
  publicKey: licenseValidationPublicKeyPEM,
  signature: 'signature02',
  platformOrganizationName: 'platformOrganizationName02',
  platformFrontendUrl: 'platformFrontendUrl02',
  platformOwnerAddressPLZ: 'platformOwnerAddressPLZ02',
  platformOwnerAddressCity: 'platformOwnerAddressCity02',
  platformOwnerAddressStreet: 'platformOwnerAddressStreet02',
  platformOwnerAddressStreetNumber: 'platformOwnerAddressStreetNumber02',
  validFromUtc: new Date('2021-04-01T00:00:00Z'),
  validToUtc: new Date('2023-10-31T23:59:59Z'),
};
export const licenseInfo02: LicenseInfoDto = {
  id: license02.id,
  validFromUtc: license02.validFromUtc,
  validToUtc: license02.validToUtc,
  isLicenseActive: false,
};

export const license03: LicenseDto = {
  id: idLicense03,
  userId: 'userId',
  publicKey: licenseValidationPublicKeyPEM,
  signature: 'signature03',
  platformOrganizationName: 'platformOrganizationName03',
  platformFrontendUrl: 'platformFrontendUrl03',
  platformOwnerAddressPLZ: 'platformOwnerAddressPLZ03',
  platformOwnerAddressCity: 'platformOwnerAddressCity03',
  platformOwnerAddressStreet: 'platformOwnerAddressStreet03',
  platformOwnerAddressStreetNumber: 'platformOwnerAddressStreetNumber03',
  validFromUtc: new Date('2027-01-01T00:00:00Z'),
  validToUtc: new Date('2029-12-31T23:59:59Z'),
};
export const licenseInfo03: LicenseInfoDto = {
  id: license03.id,
  validFromUtc: license03.validFromUtc,
  validToUtc: license03.validToUtc,
  isLicenseActive: false,
};

export const license04: LicenseDto = {
  id: idLicense04,
  userId: 'userId',
  publicKey: licenseValidationPublicKeyPEM,
  signature: 'signature04',
  platformOrganizationName: 'platformOrganizationName04',
  platformFrontendUrl: 'platformFrontendUrl04',
  platformOwnerAddressPLZ: 'platformOwnerAddressPLZ04',
  platformOwnerAddressCity: 'platformOwnerAddressCity04',
  platformOwnerAddressStreet: 'platformOwnerAddressStreet04',
  platformOwnerAddressStreetNumber: 'platformOwnerAddressStreetNumber04',
  validFromUtc: new Date('2024-01-01T00:00:00Z'),
  validToUtc: new Date('2024-12-31T23:59:59Z'),
};
export const licenseInfo04: LicenseInfoDto = {
  id: license04.id,
  validFromUtc: license04.validFromUtc,
  validToUtc: license04.validToUtc,
  isLicenseActive: true,
};

export const license05: LicenseDto = {
  id: idLicense05,
  userId: 'userId',
  publicKey: licenseValidationPublicKeyPEM,
  signature: 'signature05',
  platformOrganizationName: 'platformOrganizationName05',
  platformFrontendUrl: 'platformFrontendUrl05',
  platformOwnerAddressPLZ: 'platformOwnerAddressPLZ05',
  platformOwnerAddressCity: 'platformOwnerAddressCity05',
  platformOwnerAddressStreet: 'platformOwnerAddressStreet05',
  platformOwnerAddressStreetNumber: 'platformOwnerAddressStreetNumber05',
  validFromUtc: new Date('2022-011-01T00:00:00Z'),
  validToUtc: new Date('2026-08-31T23:59:59Z'),
};
export const licenseInfo05: LicenseInfoDto = {
  id: license05.id,
  validFromUtc: license05.validFromUtc,
  validToUtc: license05.validToUtc,
  isLicenseActive: true,
};

export const mockedLicenses: LicenseDto[] = [license01, license02, license03, license04, license05];
export const mockedLicenseInfos: LicenseInfoDto[] = [
  licenseInfo01,
  licenseInfo02,
  licenseInfo03,
  licenseInfo04,
  licenseInfo05,
];
