import axios from 'axios';

const lmnApi = axios.create({
  baseURL: `${window.location.origin}/api/v1/`,
});

export default lmnApi;
