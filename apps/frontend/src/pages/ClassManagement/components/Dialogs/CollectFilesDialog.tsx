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

import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { t } from 'i18next';
import React from 'react';
import ShareCollectDialogProps from '@libs/classManagement/types/shareCollectDialogProps';
import { FaCopy, FaCut } from 'react-icons/fa';
import { LmnApiCollectOperationsType } from '@libs/lmnApi/types/lmnApiCollectOperationsType';
import { RadioGroupItemSH, RadioGroupSH } from '@/components/ui/RadioGroupSH';
import LMN_API_COLLECT_OPERATIONS from '@libs/lmnApi/constants/lmnApiCollectOperations';
import useFileSharingMoveDialogStore from '@/pages/FileSharing/useFileSharingMoveDialogStore';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import WebdavShareSelectDropdown from '@/pages/FileSharing/Dialog/DialogBodys/WebdavShareSelectDropdown';

const CollectFilesDialog: React.FC<ShareCollectDialogProps> = ({ title, isOpen, onClose, action }) => {
  const { activeCollectionOperation, setActiveCollectionOperation } = useFileSharingMoveDialogStore();

  const options: Record<LmnApiCollectOperationsType, { label: string; icon: JSX.Element }> = {
    [LMN_API_COLLECT_OPERATIONS.CUT]: {
      label: t('common.cut'),
      icon: <FaCut />,
    },
    [LMN_API_COLLECT_OPERATIONS.COPY]: {
      label: t('common.copy.doCopy'),
      icon: <FaCopy />,
    },
  };

  const getDialogBody = () => (
    <>
      <WebdavShareSelectDropdown showRootOnly />
      <div className="w-full items-center pb-6 ">{t('classmanagement.copyOrCut')}</div>
      <div className="flex flex-col items-center justify-start pb-8">
        <RadioGroupSH
          className="flex flex-col gap-4"
          value={activeCollectionOperation}
          onValueChange={(value: LmnApiCollectOperationsType) => {
            if (options[value]) {
              setActiveCollectionOperation(value);
            }
          }}
        >
          {Object.entries(options).map(([key, option]) => (
            <div
              key={key}
              id={`option-${key}`}
              className="flex cursor-pointer items-center gap-2"
            >
              <RadioGroupItemSH
                id={`option-${key}`}
                value={key}
                checked={activeCollectionOperation === key}
              />
              <label htmlFor={`option-${key}`}>
                <div className="flex flex-row justify-center space-x-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
              </label>
            </div>
          ))}
        </RadioGroupSH>
      </div>
    </>
  );

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={onClose}
      handleSubmit={action}
      submitButtonText={`classmanagement.${title}`}
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={onClose}
      title={t(`classmanagement.${title}`)}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default CollectFilesDialog;
