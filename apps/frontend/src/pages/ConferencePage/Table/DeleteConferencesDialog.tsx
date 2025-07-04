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

import React from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import useConferenceStore from '@/pages/ConferencePage/useConferenceStore';
import ItemDialogList from '@/components/shared/ItemDialogList';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

interface DeleteConferencesDialogProps {
  trigger?: React.ReactNode;
}

const DeleteConferencesDialog = ({ trigger }: DeleteConferencesDialogProps) => {
  const { selectedRows } = useConferenceStore();
  const {
    isLoading,
    error,
    deleteConferences,
    conferences,
    isDeleteConferencesDialogOpen,
    setIsDeleteConferencesDialogOpen,
  } = useConferenceStore();
  const { t } = useTranslation();

  const selectedConferenceIds = Object.keys(selectedRows);
  const selectedConferences = conferences.filter((c) => selectedConferenceIds.includes(c.meetingID));
  const isMultiDelete = selectedConferences.length > 1;

  const onSubmit = async () => {
    await deleteConferences(selectedConferences);
    setIsDeleteConferencesDialogOpen(false);
  };

  const getDialogBody = () => {
    if (isLoading) return <CircleLoader className="mx-auto mt-5" />;

    return (
      <div className="text-background">
        {error ? (
          <>
            {t('conferences.error')}: {error.message}
          </>
        ) : (
          <ItemDialogList
            deleteWarningTranslationId={
              isMultiDelete ? 'conferences.confirmMultiDelete' : 'conferences.confirmSingleDelete'
            }
            items={selectedConferences.map((c) => ({ name: c.name, id: c.meetingID }))}
          />
        )}
      </div>
    );
  };

  const handleClose = () => setIsDeleteConferencesDialogOpen(false);

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={onSubmit}
      submitButtonText="common.delete"
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isDeleteConferencesDialogOpen}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={t(isMultiDelete ? 'conferences.deleteConferences' : 'conferences.deleteConference', {
        count: selectedConferences.length,
      })}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default DeleteConferencesDialog;
