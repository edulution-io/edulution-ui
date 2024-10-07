import APP_INTEGRATION_VARIANT from '../constants/appIntegrationVariants';

type AppIntegrationType = (typeof APP_INTEGRATION_VARIANT)[keyof typeof APP_INTEGRATION_VARIANT];

export default AppIntegrationType;
