import React from 'react';
import { useTranslation } from 'react-i18next';
import { TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import OptionHead from '@/pages/Survey/Poll/components/TableHeader/OptionHead';
import { PollType } from '@/pages/Survey/Poll/poll-types';

interface TableHeaderStaticOptionsProps {
  pollType: PollType;
  pollName: string;
  currentOptions: string[] | Date[] | number[];
}

const StaticHeader = (props: TableHeaderStaticOptionsProps) => {
  const { pollType, pollName, currentOptions } = props;

  const { t } = useTranslation();

  return (
    <TableHeader>
      <TableRow className="text-white">
        <TableHead
          key={`poll_${pollName}_table_header_participant`}
          className="w-[250px] rounded-xl bg-gray-900 p-4 text-center"
        >
          {t('survey.poll.participants')}
        </TableHead>
        {currentOptions.map((header) => (
          <OptionHead
            key={`poll_${pollName}_table_header_${header.toString()}`}
            pollType={pollType}
            option={header}
          />
        ))}
      </TableRow>
    </TableHeader>
  );
};

export default StaticHeader;
