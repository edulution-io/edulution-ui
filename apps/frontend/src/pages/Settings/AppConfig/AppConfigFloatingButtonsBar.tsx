import React from 'react';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import SaveButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/saveButton';

type AppConfigButtonsProps = {
  handleDeleteSettingsItem: () => void;
  handleSaveSettingsItem: () => void;
};
const AppConfigFloatingButtons: React.FC<AppConfigButtonsProps> = ({
  handleDeleteSettingsItem,
  handleSaveSettingsItem,
}) => {
  const config: FloatingButtonsBarConfig = {
    buttons: [DeleteButton(handleDeleteSettingsItem), SaveButton(handleSaveSettingsItem)],
    keyPrefix: 'appconfig-page-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default AppConfigFloatingButtons;
