import axios from 'axios';

const lmnRootAdminApi = axios.create({
  baseURL: `${window.location.origin}/api/v1/`,
});

export default lmnRootAdminApi;
