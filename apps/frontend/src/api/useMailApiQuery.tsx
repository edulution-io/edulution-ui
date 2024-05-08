import axios from 'axios';
import { Mail } from '@/pages/Home/EmailWidget/mail-type';
import useEduApi from './useEduApiQuery';

const useMailApiQuery = () => {
  const EDU_API_MAIL_ENDPOINT = 'mail';
  const { eduApiUrl, eduApiHeaders } = useEduApi();
  const mailUrl = eduApiUrl + EDU_API_MAIL_ENDPOINT;

  const getMails = async (): Promise<Mail[] | null> => {
    const response = await axios.get(mailUrl, eduApiHeaders);
    return response.data as Mail[];
  };

  const setSeenFlag = async (id: string) => {
    await axios.put(`${mailUrl}/seen/${id}`, eduApiHeaders);
  };

  return { getMails, setSeenFlag };
};

export default useMailApiQuery;
