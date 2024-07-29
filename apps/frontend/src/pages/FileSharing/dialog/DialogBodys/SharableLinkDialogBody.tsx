import EmptyDialogProps from '@libs/filesharing/types/filesharingEmptyProps';
import React, { useEffect } from 'react';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import Input from '@/components/shared/Input';
import {
  DropdownMenuContent as Content,
  DropdownMenuItem as MenuItem,
  DropdownMenuSH as DropdownMenu,
  DropdownMenuTrigger as Trigger,
} from '@/components/ui/DropdownMenuSH';
import { Button } from '@/components/shared/Button';
import linkValidTime from '@libs/ui/constants/linkValidTime';
import { useTranslation } from 'react-i18next';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/FileSharingDialogStore';
import { MdContentCopy } from 'react-icons/md';
import { TABLE_ICON_SIZE } from '@libs/ui/constants';

const SharableLinkDialogBody: React.FC<EmptyDialogProps> = () => {
  const { selectedItems } = useFileSharingStore();
  const { t } = useTranslation();
  const { operationsResult, setValidLinkTime, selectedValidLinkTime } = useFileSharingDialogStore();
  const [fieldValue, setFieldValue] = React.useState<string | undefined>('');

  useEffect(() => {
    if (selectedItems.length === 1) {
      const basename = selectedItems[0].basename ? selectedItems[0].basename : undefined;
      setFieldValue(basename);
    } else {
      setFieldValue(operationsResult?.data);
    }
  }, [selectedItems, operationsResult]);

  return (
    <div className="flex w-full ">
      <div className="flex-grow">
        <Input
          value={fieldValue}
          readOnly
          className="h-10 rounded-md border border-gray-300 p-2"
        />
      </div>
      {selectedItems.length === 1 ? (
        <div className="w-1/16">
          <DropdownMenu>
            <Trigger asChild>
              <Button
                type="button"
                variant="btn-dropdown"
                className="h-10 rounded-md bg-blue-500 p-2 text-white"
                style={{ flex: 1 }}
              >
                {t(selectedValidLinkTime ? `time_options.${selectedValidLinkTime}` : 'time_options.one_hour')}
              </Button>
            </Trigger>
            <Content className="z-50 mt-2 w-48 rounded-md border border-gray-300 bg-white shadow-lg">
              {linkValidTime.map((time) => (
                <MenuItem
                  key={time.id}
                  onSelect={() => setValidLinkTime(time.label)}
                >
                  {t(`time_options.${time.label}`)}
                </MenuItem>
              ))}
            </Content>
          </DropdownMenu>
        </div>
      ) : (
        <Button
          type="button"
          variant="btn-dropdown"
          className="h-10 items-center rounded-md bg-blue-500 p-2 text-white"
        >
          <MdContentCopy size={TABLE_ICON_SIZE} />
        </Button>
      )}
    </div>
  );
};

export default SharableLinkDialogBody;
