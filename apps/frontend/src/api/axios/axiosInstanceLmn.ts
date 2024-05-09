import axios from 'axios';
import userStore from '@/store/userStore';
import { decryptPassword } from '@/utils/common';

const axiosInstanceLmn = axios.create({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Basic ${btoa(
      `${userStore.getState().user}:${decryptPassword({
        data: userStore.getState().webdavKey,
        key: `${import.meta.env.VITE_WEBDAV_KEY}`,
      })}`,
    )}`,
  },
});

export default axiosInstanceLmn;
