import axios from 'axios';

const eduApi = axios.create({
  baseURL: `${window.location.origin}/edu-api/`,
});

export default eduApi;
