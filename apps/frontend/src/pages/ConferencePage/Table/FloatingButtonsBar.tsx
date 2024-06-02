import React from 'react';
import { MdAdd, MdOutlineDeleteOutline } from 'react-icons/md';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import { useTranslation } from 'react-i18next';
import { TfiReload } from 'react-icons/tfi';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';

const FloatingButtonsBar = () => {
  const { openCreateConferenceDialog } = useCreateConferenceDialogStore();
  const { selectedRows, getConferences, setIsDeleteConferencesDialogOpen } = useConferenceStore();
  const { t } = useTranslation();

  const selectedConferenceIds = Object.keys(selectedRows);

  return (
    <div className="fixed bottom-8 flex flex-row bg-opacity-90">
      {selectedConferenceIds.length > 0 ? (
        <FloatingActionButton
          icon={MdOutlineDeleteOutline}
          text={t('conferences.delete')}
          onClick={() => setIsDeleteConferencesDialogOpen(true)}
        />
      ) : null}

      <FloatingActionButton
        icon={MdAdd}
        text={t('conferences.create')}
        onClick={openCreateConferenceDialog}
      />

      <FloatingActionButton
        icon={TfiReload}
        text={t('common.reload')}
        onClick={() => getConferences().catch((e) => console.error(e))}
      />
    </div>
  );
};

export default FloatingButtonsBar;
