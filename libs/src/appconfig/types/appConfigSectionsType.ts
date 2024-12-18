import AppConfigSectionsKeys from '@libs/appconfig/constants/appConfigSectionsKeys';

export type AppConfigSectionsType = (typeof AppConfigSectionsKeys)[keyof typeof AppConfigSectionsKeys];

export type AppConfigSections = {
  [T in AppConfigSectionsType]?: string;
};
