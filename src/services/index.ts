import axios from 'axios';

export const fetchRepoData = async () => {
  try {
    const result: any = await axios.get(
      'https://api.github.com/repos/tannerlinsley/react-query'
    );
    return result.data;
  } catch (e) {
    console.log(e);
  }
};

export const authenticate = async () => {
  try {
    const result: any = await axios.get(
      'https://api.github.com/repos/tannerlinsley/react-query'
    );
    return result.data;
  } catch (e) {
    console.log(e);
  }
};
