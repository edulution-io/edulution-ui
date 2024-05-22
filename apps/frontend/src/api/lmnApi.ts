import axios from 'axios';

const eduApi = axios.create({
  baseURL: `${window.location.origin}/api/v1/`,
});

export default eduApi;
