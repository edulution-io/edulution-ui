import React from 'react';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import { AppConfigDto } from '@libs/appconfig/types';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useFrameStore from '@/components/framing/FrameStore';
import APP_CONFIG_SECTIONS_NAME_GENERAL from '@libs/appconfig/constants/sectionsNameAppConfigGeneral';
import APP_CONFIG_SECTION_KEYS_GENERAL from '@libs/appconfig/constants/appConfigSectionKeysGeneral';

const EmbeddedIframes = () => {
  const { appConfigs } = useAppConfigsStore();
  const { loadedFrames, activeFrame } = useFrameStore();

  const getStyle = (appName: string) => (activeFrame === appName ? { display: 'block' } : { display: 'none' });

  return appConfigs
    .filter((appConfig) => appConfig.appType === APP_INTEGRATION_VARIANT.EMBEDDED)
    ?.map((currentConfig: AppConfigDto) =>
      currentConfig.options
        ?.filter((section) => section.sectionName === APP_CONFIG_SECTIONS_NAME_GENERAL)
        .map((currentSection) => {
          const appConfigURLField = currentSection.options.find(
            (field) => field.name === APP_CONFIG_SECTION_KEYS_GENERAL.URL,
          );
          return (
            <iframe
              key={currentConfig.name}
              title={currentConfig.name}
              className="absolute inset-y-0 left-0 ml-0 mr-14 w-full md:w-[calc(100%-var(--sidebar-width))]"
              height="100%"
              src={
                loadedFrames.includes(currentConfig.name)
                  ? (appConfigURLField?.value as string) || (appConfigURLField?.defaultValue as string)
                  : undefined
              }
              style={getStyle(currentConfig.name)}
            />
          );
        }),
    );
};

export default EmbeddedIframes;
