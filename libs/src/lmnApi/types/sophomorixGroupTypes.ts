import SOPHOMORIX_GROUP_TYPES from '@libs/lmnApi/constants/sophomorixGroupTypes';

type SophomorixGroupTypes = (typeof SOPHOMORIX_GROUP_TYPES)[keyof typeof SOPHOMORIX_GROUP_TYPES];

export default SophomorixGroupTypes;
