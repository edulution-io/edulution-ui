import axios from "axios";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleApiError = (error: any, set: (params: any) => void) => {
  if (axios.isAxiosError(error)) {
    set({error, isLoading: false});
  } else {
    set({error: new Error('An unexpected error occurred'), isLoading: false});
  }
}

export default handleApiError;
