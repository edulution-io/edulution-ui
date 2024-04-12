import axios from 'axios';

const axiosInstanceLmn = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstanceLmn;
