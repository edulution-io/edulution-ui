import { AppConfigSectionsType } from '@libs/appconfig/types/appConfigSectionsType';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';

type AppConfigExtendedOptionsBySections = { [section in AppConfigSectionsType]?: AppConfigExtendedOption[] };

export default AppConfigExtendedOptionsBySections;
