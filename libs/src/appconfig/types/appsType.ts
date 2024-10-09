import APPS from '../constants/apps';

type TApps = (typeof APPS)[keyof typeof APPS];

export default TApps;
