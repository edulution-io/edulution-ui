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

import React, { useRef, useEffect, useReducer, useCallback } from 'react';
import { LogoImage, SvgIcon, LoadingIndicatorComponent } from 'survey-react-ui';
import { LogoImageViewModel, SurveyCreatorModel } from 'survey-creator-core';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';

interface CustomLogoImageProps {
  data: SurveyCreatorModel;
}

type IconButtonProps = {
  className?: string;
  iconName: string;
  iconClassName?: string;
  onClick: () => void;
};

const IconButton = ({ className, iconName, iconClassName, onClick }: IconButtonProps) => (
  <span
    className={className ?? 'svc-context-button'}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
  >
    <SvgIcon
      size="auto"
      iconName={iconName}
      className={iconClassName}
    />
  </span>
);

const CustomLogoImageComponent = ({ data }: CustomLogoImageProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<LogoImageViewModel | null>(null);

  const [, tick] = useReducer((x: number) => x + 1, 0);

  if (!modelRef.current) {
    modelRef.current = new LogoImageViewModel(data, rootRef.current!);
  }

  useEffect(() => {
    if (!modelRef.current) return undefined;
    const logoModel = modelRef.current;
    if (rootRef.current) {
      logoModel.root = rootRef.current;
    }

    const keyHandlerName = 'survey-creator-logo-image-key-handler';
    logoModel.registerPropertyChangedHandlers(['isUploading'], () => tick(), keyHandlerName);

    return () => {
      logoModel.unregisterPropertyChangedHandlers(['isUploading'], keyHandlerName);
      logoModel.dispose();
    };
  }, [modelRef]);

  const { survey } = data;

  const handleChooseFile = useCallback(() => {
    const logoModel = modelRef.current;
    if (!logoModel) return;
    logoModel.chooseFile(logoModel);
  }, []);

  const handleRemove = useCallback(() => {
    const logoModel = modelRef.current;
    if (!logoModel) return;
    logoModel.remove(logoModel);
  }, []);

  const handleOpenSettings = useCallback(() => {
    useSurveyEditorPageStore.getState().setIsOpenSurveysLogoDialog(true);
  }, []);

  const renderInput = () => {
    const logoModel = modelRef.current;
    if (!logoModel) return null;
    return (
      <input
        aria-hidden="true"
        type="file"
        tabIndex={-1}
        accept={logoModel.acceptedTypes}
        className="svc-choose-file-input"
      />
    );
  };

  const renderButtons = () => (
    <div className="svc-context-container svc-logo-image-controls">
      <IconButton
        className="svc-context-button"
        iconName="icon-choosefile"
        iconClassName="icon-choosefile hover:svc-icon-choosefile--hover"
        onClick={handleChooseFile}
      />
      <IconButton
        className="svc-context-button svc-context-button--danger"
        iconName="icon-clear"
        iconClassName="icon-clear hover:svc-icon-clear--hover"
        onClick={handleRemove}
      />
      <IconButton
        className="svc-context-button svc-context-button--settings"
        iconName="icon-settings"
        iconClassName="icon-settings hover:svc-icon-settings--hover"
        onClick={handleOpenSettings}
      />
    </div>
  );

  const renderImage = (logoModel: LogoImageViewModel) => (
    <div className={logoModel.containerCss}>
      {renderButtons()}
      <LogoImage data={survey} />
    </div>
  );

  const renderPlaceholder = () => (
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

  const renderLoadingIndicator = () => (
    <div className="svc-logo-image__loading">
      <LoadingIndicatorComponent />
    </div>
  );

  const renderContent = () => {
    const logoModel = modelRef.current;
    if (!logoModel) return null;
    if (logoModel.isUploading) {
      return renderLoadingIndicator();
    }
    if (survey.locLogo.renderedHtml) {
      return renderImage(logoModel);
    }
    if (logoModel.allowEdit) {
      return renderPlaceholder();
    }
    return null;
  };

  return (
    <div
      ref={rootRef}
      className="svc-logo-image"
    >
      {renderInput()}
      {renderContent()}
    </div>
  );
};

export default CustomLogoImageComponent;
