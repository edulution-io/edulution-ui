import axios from 'axios';

const eduApiInstance = axios.create({
  baseURL: `${window.location.origin}/edu-api/`,
});

export default eduApiInstance;
