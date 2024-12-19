import VEYON_ERROR_MESSAGES from '../constants/veyonErrorMessages';

type VeyonErrorMessages = (typeof VEYON_ERROR_MESSAGES)[keyof typeof VEYON_ERROR_MESSAGES];

export default VeyonErrorMessages;
