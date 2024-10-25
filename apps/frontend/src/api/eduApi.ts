import axios from 'axios';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';

const eduApi = axios.create({
  baseURL: `${window.location.origin}/${EDU_API_ROOT}/`,
});

export default eduApi;
