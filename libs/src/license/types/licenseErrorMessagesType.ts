import LicenseErrorMessages from '../constants/licenseErrorMessages';

type LicenseErrorMessagesType = (typeof LicenseErrorMessages)[keyof typeof LicenseErrorMessages];

export default LicenseErrorMessagesType;
