/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { useRef, useEffect, useState } from 'react';
import { LogoImage, SvgIcon, LoadingIndicatorComponent } from 'survey-react-ui';
import { LogoImageViewModel, SurveyCreatorModel } from 'survey-creator-core';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';

interface CustomLogoImageProps {
  data: SurveyCreatorModel;
}

const CustomLogoImageComponent = ({ data }: CustomLogoImageProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState({});

  const modelRef = useRef<LogoImageViewModel | null>(null);
  if (!modelRef.current) {
    modelRef.current = new LogoImageViewModel(data, rootRef.current!);
  }
  const logoModel = modelRef.current;

  useEffect(() => {
    if (rootRef.current) {
      logoModel.root = rootRef.current;
    }
    logoModel.registerPropertyChangedHandlers(['isUploading'], () => {
      forceUpdate({});
    });
  }, [logoModel]);

  const { survey } = data;

  const handleChooseFile = () => {
    logoModel.chooseFile(logoModel);
  };

  const handleRemove = () => {
    logoModel.remove(logoModel);
  };

  const handleOpenSettings = () => {
    useSurveyEditorPageStore.getState().setIsOpenSurveyContextMenu(true);
  };

  const renderChooseButton = () => (
    <span
      className="svc-context-button background-white"
      onClick={handleChooseFile}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleChooseFile()}
    >
      <SvgIcon
        size="auto"
        iconName="icon-choosefile"
        className="icon-choosefile hover:svc-icon-choosefile--hover"
      />
    </span>
  );

  const renderClearButton = () => (
    <span
      className="svc-context-button svc-context-button--danger bg-white"
      onClick={handleRemove}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleRemove()}
    >
      <SvgIcon
        size="auto"
        iconName="icon-clear"
        className="icon-clear hover:svc-icon-clear--hover"
      />
    </span>
  );

  const renderSettingsButton = () => (
    <span
      className="svc-context-button svc-context-button--settings bg-white"
      onClick={handleOpenSettings}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleOpenSettings()}
    >
      <SvgIcon
        size="auto"
        iconName="icon-settings"
        className="icon-settings hover:svc-icon-settings--hover"
      />
    </span>
  );

  const renderButtons = () => (
    <div className="svc-context-container svc-logo-image-controls">
      {renderChooseButton()}
      {renderClearButton()}
      {renderSettingsButton()}
    </div>
  );

  const renderImage = () => (
    <div className={logoModel.containerCss}>
      {renderButtons()}
      <LogoImage data={survey} />
    </div>
  );

  const renderPlaceholder = () => {
    if (!logoModel.allowEdit || logoModel.isUploading) return null;
    return (
      <div
        className="svc-logo-image-placeholder"
        onClick={handleChooseFile}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleChooseFile()}
      >
        <svg>
          <use xlinkHref="#icon-image-48x48" />
        </svg>
      </div>
    );
  };

  const renderInput = () => (
    <input
      aria-hidden="true"
      type="file"
      tabIndex={-1}
      accept={logoModel.acceptedTypes}
      className="svc-choose-file-input"
    />
  );

  const renderLoadingIndicator = () => (
    <div className="svc-logo-image__loading">
      <LoadingIndicatorComponent />
    </div>
  );

  let content = null;
  if (survey.locLogo.renderedHtml && !logoModel.isUploading) {
    content = renderImage();
  } else if (logoModel.isUploading) {
    content = renderLoadingIndicator();
  } else {
    content = renderPlaceholder();
  }

  return (
    <div
      ref={rootRef}
      className="svc-logo-image"
    >
      {renderInput()}
      {content}
    </div>
  );
};

export default CustomLogoImageComponent;
