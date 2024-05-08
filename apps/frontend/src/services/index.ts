import axios from 'axios';

export type ResponseData = {
  data: JSON;
};

export const fetchRepoData = async () => {
  try {
    const result: ResponseData = await axios.get('https://api.github.com/repos/tannerlinsley/react-query');
    return result.data;
  } catch (e) {
    return undefined;
  }
};

export const authenticate = async () => {
  try {
    const result: ResponseData = await axios.get('https://api.github.com/repos/tannerlinsley/react-query');
    return result.data;
  } catch (e) {
    return undefined;
  }
};
