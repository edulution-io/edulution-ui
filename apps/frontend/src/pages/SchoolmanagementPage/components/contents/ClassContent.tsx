import { FC, useState } from 'react';
import GroupCard from '@/pages/SchoolmanagementPage/components/GroupCard';
import { MdGroups } from 'react-icons/md';
import { useSearchParams } from 'react-router-dom';
import { GroupCardRowProps } from '@/pages/SchoolmanagementPage/utilis/types.ts';

const ClassContent: FC<GroupCardRowProps> = ({ schoolclasses }) => {
  const [activeClass, setActiveClass] = useState<string | undefined>(undefined);
  const [searchParams, setSearchParams] = useSearchParams();

  const appendSearchParams = (key: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set(key, value);
    setSearchParams(newSearchParams);
  };

  const handleItemClicked = (className: string) => {
    if (activeClass === className) {
      setActiveClass(undefined);
      appendSearchParams('class', '');
      return;
    }
    setActiveClass(className);
    appendSearchParams('class', className);
  };

  return !schoolclasses || Object.keys(schoolclasses).length === 0 ? (
    <p>No schoolclass data available. {activeClass}</p>
  ) : (
    <>
      {Object.entries(schoolclasses).map(([className, members]) => (
        <GroupCard
          key={className}
          icon={<MdGroups className="h-8 w-8 text-white" />}
          title={className}
          participants={Object.keys(members).length}
          showActions={false}
          onEdit={() => {}}
          onCopy={() => {}}
          onDelete={() => {}}
          onItemClicked={() => handleItemClicked(className)}
          isComponentSelected={activeClass === className}
        />
      ))}
    </>
  );
};

export default ClassContent;
