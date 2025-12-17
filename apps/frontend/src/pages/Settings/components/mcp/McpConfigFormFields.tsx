import React from 'react';
import { useTranslation } from 'react-i18next';
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import Input from '@/components/shared/Input';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import useGroupStore from '@/store/GroupStore';
import useUserStore from '@/store/UserStore/useUserStore';
import McpConfigDto from '@libs/mcp/types/mcpConfigDto';
import MCP_CONFIG_TABLE_COLUMNS from '@libs/mcp/constants/mcpConfigTableColumns';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import AttendeeDto from '@libs/user/types/attendee.dto';
import McpConnectionTestResult from '@libs/mcp/types/mcpConnectionTestResult';
import McpConnectionStatus from './McpConnectionStatus';

interface McpConfigFormFieldsProps {
  control: Control<McpConfigDto>;
  watch: UseFormWatch<McpConfigDto>;
  setValue: UseFormSetValue<McpConfigDto>;
  isTesting: boolean;
  testResult: McpConnectionTestResult | null;
}

const McpConfigFormFields: React.FC<McpConfigFormFieldsProps> = ({
  control,
  watch,
  setValue,
  isTesting,
  testResult,
}) => {
  const { t } = useTranslation();
  const { searchGroups } = useGroupStore();
  const { searchAttendees } = useUserStore();

  const handleUsersChange = (users: AttendeeDto[]) => {
    setValue(MCP_CONFIG_TABLE_COLUMNS.ALLOWED_USERS, users, { shouldValidate: true });
  };

  const handleGroupsChange = (groups: MultipleSelectorGroup[]) => {
    setValue(MCP_CONFIG_TABLE_COLUMNS.ALLOWED_GROUPS, groups, { shouldValidate: true });
  };

  const onUsersSearch = async (value: string): Promise<AttendeeDto[]> => searchAttendees(value);

  return (
    <>
      <FormFieldSH
        control={control}
        name={MCP_CONFIG_TABLE_COLUMNS.NAME}
        render={({ field }) => (
          <FormItem>
            <p className="font-bold">{t('mcpconfig.settings.name')}</p>
            <FormControl>
              <Input
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                variant="dialog"
              />
            </FormControl>
            <FormMessage className="text-p" />
          </FormItem>
        )}
      />

      <FormFieldSH
        control={control}
        name={MCP_CONFIG_TABLE_COLUMNS.URL}
        render={({ field }) => (
          <FormItem>
            <p className="font-bold">{t('mcpconfig.settings.serverUrl')}</p>
            <FormControl>
              <Input
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                variant="dialog"
                autoComplete="off"
                placeholder="http://localhost:3002/mcp"
              />
            </FormControl>
            <McpConnectionStatus
              isTesting={isTesting}
              testResult={testResult}
              showToolList
            />
            <FormMessage className="text-p" />
          </FormItem>
        )}
      />

      <SearchUsersOrGroups
        users={watch(MCP_CONFIG_TABLE_COLUMNS.ALLOWED_USERS) || []}
        onSearch={onUsersSearch}
        onUserChange={handleUsersChange}
        groups={watch(MCP_CONFIG_TABLE_COLUMNS.ALLOWED_GROUPS) || []}
        onGroupSearch={searchGroups}
        onGroupsChange={handleGroupsChange}
        variant="dialog"
      />
    </>
  );
};

export default McpConfigFormFields;
