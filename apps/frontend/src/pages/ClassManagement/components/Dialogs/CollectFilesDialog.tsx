/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
