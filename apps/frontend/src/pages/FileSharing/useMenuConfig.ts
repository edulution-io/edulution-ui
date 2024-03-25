import { FileSharing, teacher, project, iso, programm, share, students } from '@/assets/icons';
import { useState, useEffect } from 'react';
import { MdOutlineNoteAdd } from 'react-icons/md';
import useFileManagerStore from '@/store/fileManagerStore';
import MenuItem from '@/datatypes/types';
import { DirectoryFile } from '@/datatypes/filesystem';

const findCorrespondingMountPointIcon = (mounts: DirectoryFile): string => {
  if (mounts.filename.includes('teachers')) {
    return teacher;
  }
  if (mounts.filename.includes('projects')) {
    return project;
  }
  if (mounts.filename.includes('iso')) {
    return iso;
  }
  if (mounts.filename.includes('programs')) {
    return programm;
  }
  if (mounts.filename.includes('share')) {
    return share;
  }
  if (mounts.filename.includes('students')) {
    return students;
  }
  return FileSharing;
};

const useMenuItems = () => {
  const { fetchMountPoints, fetchFiles } = useFileManagerStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchAndPrepareMenuItems = async () => {
      try {
        const mounts: DirectoryFile[] = await fetchMountPoints();
        const items = mounts.map((mountPoint) => ({
          path: mountPoint.filename.includes('teachers')
            ? `${mountPoint.filename}/${import.meta.env.VITE_USERNAME}`
            : mountPoint.filename,
          label: mountPoint.filename.includes('teachers') ? 'Home' : mountPoint.basename,
          IconComponent: MdOutlineNoteAdd,
          hoverColor: 'bg-blue-500',
          icon: findCorrespondingMountPointIcon(mountPoint),
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

    fetchAndPrepareMenuItems().catch(() => {});
  }, []);

  return menuItems;
};

export default useMenuItems;
