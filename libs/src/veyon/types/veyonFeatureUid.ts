import VEYON_FEATURE_ACTIONS from '../constants/veyonFeatureActions';

type VeyonFeatureUid = (typeof VEYON_FEATURE_ACTIONS)[keyof typeof VEYON_FEATURE_ACTIONS];

export default VeyonFeatureUid;
