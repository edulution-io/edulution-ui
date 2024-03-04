// useMenuItems.js
import { useState, useEffect } from 'react';
import { MdOutlineNoteAdd } from 'react-icons/md';
import { getFileNameFromPath } from '@/utils/common';
import useWebDavActions from '@/utils/webDavHooks';
import MenuItem from '@/datatypes/types';
import { DirectoryFile } from '@/datatypes/filesystem';

const useMenuItems = () => {
  const { fetchMountPoints, fetchFiles } = useWebDavActions();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]); // Initialize as an empty array

  useEffect(() => {
    const fetchAndPrepareMenuItems = async () => {
      try {
        const mounts: DirectoryFile[] = await fetchMountPoints();
        const items = mounts.map((mountPoint) => ({
          label: getFileNameFromPath(mountPoint.filename),
          IconComponent: MdOutlineNoteAdd,
          icon: '',
          action: async () => {
            try {
              await fetchFiles(mountPoint.filename);
            } catch (error) {
              console.error('Error fetching files:', error);
            }
          },
        }));
        setMenuItems(items);
      } catch (error) {
        console.error('Error fetching mount points:', error);
      }
    };

    fetchAndPrepareMenuItems().catch(() => console.log('Error fetching mount points'));
  }, []);

  console.log(menuItems);
  return menuItems;
};

export default useMenuItems;
