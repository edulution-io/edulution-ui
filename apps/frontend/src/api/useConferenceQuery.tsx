import axios from 'axios';
import CreateConferenceDto from '@/pages/ConferencePage/dto/create-conference.dto';
import { Conference } from '@/pages/ConferencePage/dto/conference.dto';
import UpdateConferenceDto from '@/pages/ConferencePage/dto/update-conference.dto';
import useEduApi from './useEduApiQuery';

const useConferenceQuery = () => {
  const EDU_API_ENDPOINT = 'conferences';
  const { eduApiUrl, eduApiHeaders } = useEduApi();
  const url = eduApiUrl + EDU_API_ENDPOINT;

  const createConference = async (conference: CreateConferenceDto): Promise<Conference> => {
    const response = await axios.post<Conference>(url, conference, eduApiHeaders);
    return response.data;
  };

  const getConferences = async (): Promise<Conference[] | null> => {
    const response = await axios.get<Conference[]>(url, eduApiHeaders);

    return response.data;
  };

  const getConference = async (meetingID: string) => {
    await axios.put(`${url}/${meetingID}`, eduApiHeaders);
  };

  const updateConference = async (meetingID: string, conference: UpdateConferenceDto) => {
    await axios.put(`${url}/${meetingID}`, conference, eduApiHeaders);
  };

  const removeConference = async (meetingID: string) => {
    await axios.delete(`${url}/${meetingID}`, eduApiHeaders);
  };

  return { createConference, getConferences, getConference, updateConference, removeConference };
};

export default useConferenceQuery;
