import axios from 'axios';

const lmnApiBasicAuth = axios.create({
  baseURL: `${window.location.origin}/api/v1/`,
});

export default lmnApiBasicAuth;
